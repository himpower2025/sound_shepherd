import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import webpush from 'web-push';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

// 1. Configure VAPID (Web Push protocol handshake keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BPK_UaJ32VndRn8srT9DoCpe_6MALEj3E15VM4_2rd1ddfUkPKnJKrT2fiADIZARhJ07PyHTeB-kFCdoKY_QYjQ";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "7FsxeWcKo0ZOd2xm6_49-DO1UMwKpAguFS8L14wmtok";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@soundshepherd.com";

if (!VAPID_PRIVATE_KEY || VAPID_PRIVATE_KEY === "YOUR_PRIVATE_KEY_HERE") {
  console.log("⚠️ WARNING: VAPID Private Key is missing or using placeholder. Please make sure to configure VAPID_PRIVATE_KEY in your local or production .env.");
}

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// 2. Initialize Firebase Admin SDK using Local applet config or system environments
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let appConfig = {};
if (fs.existsSync(configPath)) {
  try {
    appConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error("Failed to parse firebase-applet-config.json:", err);
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID || appConfig.projectId || "sound-shepherd";
const databaseId = process.env.FIREBASE_DATABASE_ID || appConfig.firestoreDatabaseId || "ai-studio-soundshepherd-79ef04cf-30e0-43fe-9657-d7db30b9fbb7";

console.log(`📡 Initializing Firebase Admin Project: "${projectId}"`);
console.log(`🗄️ Target databaseInstance: "${databaseId}"`);

try {
  // If GOOGLE_APPLICATION_CREDENTIALS exists in environment or as a JSON file, Admin SDK uses it automatically
  admin.initializeApp({
    projectId: projectId,
  });
} catch (err) {
  console.log("ℹ️ Admin SDK Initialization Status:", err.message);
}

// Instantiate Firestore targeting our specific database instance
const db = getFirestore(databaseId);

// 3. Define standard, targeted push payload
const payload = JSON.stringify({
  title: "Worship Rehearsal",
  body: "Rehearsal is starting in 10 minutes! Join us at the mixing console.",
  badgeCount: 1, // Requests browser/iOS to display the red notification badge of count '1'
  url: "/" // Redirect URL on user tap
});

async function runPushDelivery() {
  console.log("🔍 Scanning Firestore for active subscriber registrations...");
  
  try {
    const usersRef = db.collection('users');
    // Only fetch users who have explicitly enabled push notifications
    const snapshot = await usersRef.where('notificationsEnabled', '==', true).get();
    
    if (snapshot.empty) {
      console.log("ℹ️ Campaign completed: No active subscriptions with notificationsEnabled === true was found.");
      return;
    }
    
    console.log(`📱 Found ${snapshot.size} potential recipients. Initiating push protocol...`);
    
    let successCount = 0;
    let failureCount = 0;
    const promises = [];
    
    snapshot.forEach(docSnap => {
      const userData = docSnap.data();
      const subscription = userData.pushSubscription;
      const userId = docSnap.id;
      
      // Safety skip if the subscription object is corrupt or missing
      if (!subscription || !subscription.endpoint) {
        console.log(`⏩ Skipping user [${userId}]: Missing pushSubscription details.`);
        return;
      }
      
      console.log(`🚀 Sending Web Push notification packet to user [${userId}]...`);
      
      const sendPromise = webpush.sendNotification(subscription, payload)
        .then(() => {
          console.log(`   ✅ SUCCESS: Delivered packet to [${userId}] successfully.`);
          successCount++;
        })
        .catch(async (err) => {
          console.error(`   ❌ FAIL: Delivery rejected for [${userId}]. Status Code: ${err.statusCode || 'Unknown'}`);
          failureCount++;
          
          // CRITICAL HOOK: Handling expired/withdrawn subscribers (HTTP 410 / HTTP 404)
          // Automatically unsubscribe them to prune database size and maintain pristine delivery rate
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`   🧹 CLEANUP: Pruning expired token from Firestore for user [${userId}]`);
            try {
              await usersRef.doc(userId).update({
                pushSubscription: null,
                notificationsEnabled: false,
                updatedAt: new Date().toISOString()
              });
            } catch (updateErr) {
              console.error(`   ⚠️ Failed to prune expired subscription for [${userId}]:`, updateErr.message);
            }
          }
        });
        
      promises.push(sendPromise);
    });
    
    await Promise.all(promises);
    
    console.log('\n======================================================');
    console.log('🏁 WEB PUSH DISPATCH CAMPAIGN SUMMARY');
    console.log('======================================================');
    console.log(`📈 Successfully delivered devices:  ${successCount}`);
    console.log(`⚠️  Rejected or failed endpoints:    ${failureCount}`);
    console.log('======================================================');
    
  } catch (error) {
    console.error("🌋 Critical campaign failure occurred:", error);
  }
}

runPushDelivery();
