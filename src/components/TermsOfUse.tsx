import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TermsOfUseProps {
  onBack: () => void;
}

export default function TermsOfUse({ onBack }: TermsOfUseProps) {
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
          WhatIff — Terms of Use
        </h1>
        <p className="text-[12px] text-zinc-500 mb-8">
          Last updated: March 2026
        </p>

        {/* Content Sections */}
        <div className="space-y-7">
          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">1. Acceptance of Terms</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              By accessing or using WhatIff you agree to be bound by these Terms of Use. If you do not agree to these terms please do not use the application. These terms constitute a legally binding agreement between you and WhatIff.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">2. What WhatIff Is</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff is a personal finance calculator application that provides tools for computing SIP returns, EMI amounts, retirement corpus, goal planning, fixed deposit returns, loan affordability, home purchase analysis, and related financial calculations. WhatIff also provides AI-generated insights based on the numbers you enter.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              WhatIff is a calculation and education tool. It is not a financial advisory service, investment advisory service, banking service, insurance service, or any other regulated financial service.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">3. Not Financial Advice</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8] font-[700] text-white">
              This is the most important clause in these terms. Please read it carefully.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              All calculations, outputs, projections, insights, and AI-generated content provided by WhatIff are strictly for educational and informational purposes only. Nothing in WhatIff constitutes financial advice, investment advice, tax advice, legal advice, or any other professional advice of any kind.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              WhatIff is not registered with the Securities and Exchange Board of India as an investment adviser. WhatIff is not registered with the Reserve Bank of India as a financial institution. WhatIff is not affiliated with any bank, insurance company, mutual fund, broker, or financial institution.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              Before making any financial decision — including investing, borrowing, purchasing property, or planning for retirement — consult a qualified licensed professional who can assess your specific circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">4. Accuracy of Calculations</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff makes reasonable efforts to ensure its calculation formulas are correct. However all calculations involve assumptions and simplifications that may not reflect real world conditions. Actual returns, costs, and outcomes may differ materially from any projection shown.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              Tax calculations are based on publicly available information and may not reflect the most current rates. Interest rates shown for banks and lenders are indicative only. Always verify current rates directly with the relevant institution.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              AI-generated insights are produced automatically and are not reviewed by qualified financial professionals before being displayed. They may contain errors or omissions.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">5. Disclaimer of Liability</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff accepts no responsibility or liability of any kind for any financial decision, loss, damage, or outcome arising from your use of this application or your reliance on any calculation, projection, estimate, or AI-generated insight shown within it.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              To the fullest extent permitted by applicable Indian law all liability is expressly disclaimed. In the unlikely event that any liability is imposed on us by a court of law despite this disclaimer our total liability to you shall not exceed ₹1,000.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              This disclaimer applies regardless of whether the claim is based on contract, tort, negligence, or any other legal theory.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">6. Indemnification</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              You agree to indemnify, defend, and hold harmless WhatIff and its founders, operators, and contributors from and against any claims, damages, losses, liabilities, costs, and expenses including reasonable legal fees arising from your use of the application, your violation of these terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">7. Intellectual Property</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              All content, code, design, trademarks, and other intellectual property in WhatIff are owned by or licensed to WhatIff and are protected under applicable Indian and international law.
            </p>
            <p className="text-[14px] text-zinc-400 leading-[1.8] mt-4">
              You may use the application for your personal non-commercial use only. You may not copy, reproduce, distribute, reverse engineer, decompile, or create derivative works from any part of the application. You may not use the application for any commercial purpose without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">8. User Conduct</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              You agree not to use WhatIff to violate any applicable law, transmit harmful or illegal content, attempt to gain unauthorised access to any part of the application or its infrastructure, interfere with or disrupt the application, use automated tools to scrape or extract data, or impersonate any person or entity.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">9. Third Party Services</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff uses third party services for certain features. We are not responsible for the availability, accuracy, or content of any third party service. Your use of third party services is subject to their own terms and policies. Links to third party websites are provided for convenience only and do not constitute an endorsement.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">10. Disclaimer of Warranties</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              WhatIff is provided as is and as available without warranty of any kind, express or implied. We expressly disclaim all warranties including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do not warrant that the application will be uninterrupted, error-free, or free from harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">11. Governing Law and Disputes</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              These terms are governed by the laws of India. Any dispute arising from these terms or your use of the application shall first be attempted to be resolved through good faith negotiation. If negotiation fails the dispute shall be subject to the exclusive jurisdiction of the courts of [your city], India.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">12. Severability</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              If any provision of these terms is found to be unenforceable or invalid under applicable law that provision shall be modified to the minimum extent necessary to make it enforceable. The remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">13. Changes to These Terms</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              We may update these terms at any time. Changes take effect when posted with an updated date. Continued use of WhatIff after any change means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-[15px] font-[700] text-white mb-2 mt-7">14. Entire Agreement</h2>
            <p className="text-[14px] text-zinc-400 leading-[1.8]">
              These Terms of Use together with our Privacy Policy constitute the entire agreement between you and WhatIff regarding your use of the application.
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
