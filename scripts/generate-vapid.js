import webpush from 'web-push';

// Generate VAPID Keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('========================================================================');
console.log('🛡️  SOUND SHEPHERD - VAPID KEYS GENERATED');
console.log('========================================================================');
console.log('🔑 PUBLIC KEY (Copy this to VAPID_PUBLIC_KEY in your env and App.tsx):');
console.log(vapidKeys.publicKey);
console.log('\n🔒 PRIVATE KEY (Set this as VAPID_PRIVATE_KEY in your production env):');
console.log(vapidKeys.privateKey);
console.log('========================================================================');
console.log('⚠️  Store these keys securely! Never commit private keys to Source Control.');
console.log('========================================================================');
