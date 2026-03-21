import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-['DM_Sans',sans-serif]">
      <div className="max-w-[680px] mx-auto px-5 py-6 pb-[60px]">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-full transition-colors mb-8 -ml-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Title Section */}
        <h1 className="text-[22px] font-[800] text-white mb-2 tracking-tight">
          WhatIff — Privacy Policy
        </h1>
        <p className="text-[12px] text-zinc-500 mb-8">
          Last updated: March 2026
        </p>

        {/* Content Sections */}
        <div className="space-y-7">
          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">1. What WhatIff Is</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff is a free personal finance calculator built for individuals who want to understand their own numbers. There is no login, no sign up, and no account required. You open it, run your numbers, and leave. That is it.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">2. Our Core Promise</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              Your financial data belongs to you, stays with you, and is never sold, shared, or monetised. We have built WhatIff from the ground up to collect as little information about you as possible.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">3. What We Collect</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              Almost nothing.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              The numbers you type into the calculators — amounts, rates, tenures, and saved scenarios — stay on your device in your browser's local storage. We do not see them, store them on our servers, or transmit them to anyone.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              We may collect basic anonymous usage data such as which pages were visited, what device type was used, and what country the request came from. This data cannot be used to identify you individually. It contains no name, no email, no phone number, and no financial information.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">4. What We Do Not Collect</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              We do not collect your name, email address, phone number, income, PAN, Aadhaar, bank account details, or any other personal or financial identifier. We do not build user profiles. We do not track you across other websites or applications. We do not serve advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">5. AI Features</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              When you choose to use the AI insight feature, the numerical inputs from your current calculator session are sent to a third party AI service solely to generate the insight. Only the numbers you entered are sent — no personal information, no identity, no device fingerprint, and no location data. You can use WhatIff fully without ever using the AI insight feature. If you choose not to use it, no data of any kind leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">6. Third Party Services</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff uses third party services for certain features including AI insights and analytics. These services receive only the minimum data necessary to perform their function. No personal identifying information is shared with any third party. Your use of any third party service linked or referenced within WhatIff is subject to that service's own terms and privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">7. Cookies</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              We do not use tracking cookies or advertising cookies. Any storage we use is limited to your browser's local storage for saving your calculator inputs and scenarios on your own device.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">8. Your Data and Your Rights</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              Since we do not collect personal data there is nothing for us to hold, share, or delete on our end. Your calculator inputs are stored locally on your device and are entirely under your control. You may clear them at any time by clearing your browser's local storage or cache.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              To the extent any applicable law including India's Digital Personal Data Protection Act 2023 grants you rights over personal data, those rights are effectively already exercised by design since we do not collect personal data.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">9. Security</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              We take reasonable technical measures to protect the security of our application. Since your financial data never reaches our servers, the primary security of your data depends on your own device. We recommend not using WhatIff on shared or public devices if you wish to keep your calculator scenarios private.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">10. Children</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff is not intended for anyone under the age of 18. We do not knowingly collect any data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">11. Disclaimer of Liability</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff provides calculations and information for educational and informational purposes only. All calculations are estimates based on the inputs you provide and mathematical assumptions. They are not financial advice, investment advice, or professional guidance of any kind.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              WhatIff accepts no responsibility or liability of any kind for any financial decision, loss, damage, or outcome arising from your use of this application or reliance on any calculation, projection, or AI-generated insight shown within it. To the fullest extent permitted by applicable Indian law all liability is expressly disclaimed. In the unlikely event that any liability is imposed on us by a court of law despite this disclaimer, our total liability shall not exceed ₹1,000.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">12. Changes to This Policy</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              If we update this policy we will update the date at the top of this page. Continued use of WhatIff after any update means you accept the revised policy. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">13. Contact</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              Questions about this Privacy Policy or how we handle data? Write to us at <a href="mailto:hello.whatiff@gmail.com" style={{ color: '#10b981', textDecoration: 'none' }}>
                hello.whatiff@gmail.com
              </a>. We will respond at our earliest.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <span className="text-[12px] text-zinc-600 font-bold tracking-widest uppercase">WhatIff</span>
        </div>
      </div>
    </div>
  );
}
