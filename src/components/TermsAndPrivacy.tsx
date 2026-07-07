import React from 'react';
import { motion } from 'motion/react';
import { X, Shield, FileText, Lock, Globe, Mail } from 'lucide-react';

interface TermsAndPrivacyProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab: 'terms' | 'privacy';
}

export function TermsAndPrivacyModal({ isOpen, onClose, defaultTab }: TermsAndPrivacyProps) {
  const [activeTab, setActiveTab] = React.useState<'terms' | 'privacy'>(defaultTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-3xl h-[80vh] sm:h-[75vh] md:h-[70vh] rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-xl text-blue-400">
              {activeTab === 'terms' ? <FileText size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl tracking-tight uppercase italic">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                SOUND SHEPHERD • Legal Documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-transparent shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-transparent shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto text-xs sm:text-sm text-slate-600 leading-relaxed space-y-6">
          {activeTab === 'terms' ? (
            // Terms of Service
            <div className="space-y-4">
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 1 (Purpose)</h4>
                <p>
                  These Terms of Service govern the conditions, procedures, rights, duties, and responsibilities of the user and the company regarding the use of the mobile app and web application <strong>&quot;Sound Shepherd&quot;</strong> (hereinafter the &quot;Service&quot;) provided by <strong>HIMPOWER PVT. LTD.</strong> (hereinafter the &quot;Company&quot;).
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 2 (Definitions)</h4>
                <p>
                  The terms used in these Terms of Service are defined as follows:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>&quot;Service&quot;</strong> refers to the digital software and educational platform where users can interact with virtual mixer simulations, take audio diagnostic assessments, chat with the AI audio assistant, and access professional sound engineering content.</li>
                  <li><strong>&quot;User&quot;</strong> refers to any individual, whether a registered member or guest, who accesses and uses the Service.</li>
                  <li><strong>&quot;Member&quot;</strong> refers to a user who has completed registration and social login (such as Google Sign-In) to utilize personalized features and save progress.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 3 (Effect and Modification)</h4>
                <p>
                  1. The Company shall publish these Terms of Service on the Service screen so that they are easily accessible to users.<br />
                  2. The Company may modify these Terms of Service to the extent permitted by applicable laws. In the event of a modification, the Company shall post a notice within the Service at least 7 days prior to the effective date (or 30 days prior for changes unfavorable or material to users).
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 4 (Provision and Limitation of Service)</h4>
                <p>
                  1. In principle, the Service is provided 24 hours a day, 365 days a year. However, the Service may be temporarily suspended due to hardware maintenance, system upgrades, server migrations, or force majeure events.<br />
                  2. Users must not engage in any activity that disrupts or overloads the Service infrastructure, such as hacking, DDoS attacks, or exploiting software vulnerabilities. The Company reserves the right to restrict access immediately for any abusive or unauthorized behavior.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 5 (Obligations of the Parties)</h4>
                <p>
                  1. The Company is committed to providing a stable, secure, and reliable Service, and shall safeguard all user information in compliance with standard data protection guidelines.<br />
                  2. Members are solely responsible for the security of their connected social login credentials and devices. The Company is not responsible for any security breaches or data loss resulting from shared credentials or negligent device management.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 6 (AI Assistant Service Guidelines)</h4>
                <p>
                  1. The integrated AI assistant (Shepherd AI) uses the Google Gemini API to generate professional sound advice and educational feedback.<br />
                  2. All AI suggestions, tuning parameters, and calculated values are provided purely for educational and reference purposes. The Company does not guarantee the absolute accuracy of AI advice and is not liable for any real-world equipment damage or hearing injury arising from user adjustments.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 7 (Disclaimer & Liability Limits)</h4>
                <p>
                  1. The Company is exempt from liability for service disruptions caused by natural disasters, national emergencies, external API outages (such as Google Firebase or Gemini API services), or any force majeure.<br />
                  2. Audio visualizers, diagnostic levels, and simulation meters are estimated values dependent on browser and device hardware capabilities. They are not absolute calibration metrics and should not be used in professional hardware validation without certified instrumentation.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">Article 8 (Governing Law and Jurisdiction)</h4>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Korea. Any disputes arising out of or in connection with the Service shall be referred exclusively to the competent court of civil jurisdiction.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Effective Date: July 7, 2026</span>
                <span>HIMPOWER PVT. LTD.</span>
              </div>
            </div>
          ) : (
            // Privacy Policy
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 mb-4">
                  <strong>Sound Shepherd</strong> is committed to respecting and protecting your privacy. This Privacy Policy outlines the types of personal data we collect, why we process it, and how we protect it in connection with our Google Social Sign-In, Firebase Infrastructure, and PWA push notifications.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">1. Purposes of Data Processing</h4>
                <p>
                  The Service collects and processes personal data for the following specific purposes:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>User Authentication</strong>: Handling secure sign-in and account validation via Google Social Sign-In.</li>
                  <li><strong>Personalization & Profiles</strong>: Displaying the member&apos;s name, email, and profile avatar in their personalized mixer dashboard and training cards.</li>
                  <li><strong>Real-time Notifications</strong>: Delivering audio tips and educational reminders to members who explicitly consent to receive browser PWA push notifications.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">2. Data Items Collected & Processed</h4>
                <p>
                  We collect and process the following categories of personal data:
                </p>
                <table className="w-full text-left border-collapse mt-2 border border-slate-200">
                  <thead>
                    <tr className="bg-slate-50 font-bold">
                      <th className="p-2 border border-slate-200">Category</th>
                      <th className="p-2 border border-slate-200">Collected Items</th>
                      <th className="p-2 border border-slate-200">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 font-bold text-slate-800">Google Login</td>
                      <td className="p-2 border border-slate-200">Name, Email, Profile Image URL, UID</td>
                      <td className="p-2 border border-slate-200">User authentication and personalized settings</td>
                    </tr>
                    <tr className="bg-slate-50/30">
                      <td className="p-2 border border-slate-200 font-bold text-slate-800">PWA Notifications</td>
                      <td className="p-2 border border-slate-200">PushSubscription Browser Token</td>
                      <td className="p-2 border border-slate-200">Delivering opt-in real-time audio field tips</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 font-bold text-slate-800">Technical Logs</td>
                      <td className="p-2 border border-slate-200">Login timestamps, EQ mixing progress, performance logs</td>
                      <td className="p-2 border border-slate-200">System stability, security audits, and analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">3. Data Retention and Destruction</h4>
                <p>
                  1. We retain personal data only for as long as necessary to fulfill the services requested or until account termination (user deletion request).<br />
                  2. Upon receiving a deletion request, we permanently erase and overwrite technical database entries using secure cloud-deletion processes that cannot be recovered.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">4. Third-Party Consignment & Cloud Processors</h4>
                <p>
                  We do not sell, lease, or distribute your personal information to third parties. We utilize highly secure, globally trusted cloud sub-processors to power our application infrastructure:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Processor</strong>: Google Cloud Platform (Google Firebase Services)</li>
                  <li><strong>Nature of Consignment</strong>: Social authentication processing (Firebase Auth) and secure cloud-hosted database storage (Firestore DB) with real-time sync.</li>
                  <li><strong>Data Protection Standards</strong>: Data is encrypted both in transit (SSL/TLS) and at rest under robust compliance guidelines.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">5. User Rights & Choices</h4>
                <p>
                  1. You can log out or disconnect your Google Social Account from our platform settings at any time.<br />
                  2. You can fully control, block, or delete PWA notification tokens in your browser&apos;s site permissions settings.<br />
                  3. You have the right to request access to, correction of, or complete deletion of your data. Contact us via our official support email to request immediate deletion.
                </p>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">6. Technical Security Controls</h4>
                <p>
                  We deploy industry-standard technical measures to keep your data secure:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>End-to-End Encryption</strong>: All network requests are routed over secure HTTPS protocol using SSL/TLS encryption.</li>
                  <li><strong>Granular Server Rules</strong>: Firebase Firestore security rules strictly audit and restrict database access so that only authorized owners can access their data.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2">7. Data Protection Officer & Support</h4>
                <p>
                  If you have any questions, complaints, or requests concerning your privacy, please reach out to our privacy team:
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe size={14} className="text-blue-500" />
                    <span><strong>Entity</strong>: HIMPOWER PVT. LTD.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail size={14} className="text-blue-500" />
                    <span><strong>Contact Email</strong>: <a href="mailto:himpower2025@gmail.com" className="text-blue-600 hover:underline">himpower2025@gmail.com</a></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>Last Updated: July 7, 2026</span>
                <span>SOUND SHEPHERD Privacy Division</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area with Close Button */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Agree & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
