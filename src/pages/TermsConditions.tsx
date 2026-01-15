import { motion } from 'framer-motion';
import { FileText, Scale, Truck, CreditCard, Package, Shield, Mail, Phone } from 'lucide-react';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  const sections = [
    {
      id: '1',
      title: '1. Acceptance of Terms',
      content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service. These Terms apply to all visitors, users, and others who access or use our services, including but not limited to business customers, distributors, and partners.'
    },
    {
      id: '2',
      title: '2. Use of Website',
      content: 'You may use our website for lawful purposes only. You agree not to use the website: In any way that violates applicable federal, state, local, or international law; To transmit or procure the sending of any advertising or promotional material; To impersonate or attempt to impersonate the Company or its employees; To engage in any other conduct that restricts or inhibits anyone\'s use of the website. If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password.'
    },
    {
      id: '3',
      title: '3. B2B Services',
      content: 'Our services are primarily designed for business-to-business (B2B) transactions. By engaging with our services, you represent that you are acting on behalf of a business entity and have the authority to bind that entity to these Terms. We offer custom manufacturing services for wooden handicrafts and home decor items. All custom orders are subject to: Minimum order quantities (MOQ) as specified in quotations, Lead times varying based on product complexity and order size, Quality specifications agreed upon in writing, Payment terms as outlined in individual agreements. We provide white label manufacturing services under strict confidentiality agreements.'
    },
    {
      id: '4',
      title: '4. Ordering and Payment',
      content: 'All orders are subject to acceptance by WOODZIRE LLC. We reserve the right to refuse or cancel any order for any reason, including product availability, errors in product or pricing information, credit verification issues, or suspected fraudulent activity. Payment terms vary based on order size and customer relationship: New customers (50% advance payment, 50% before shipment), Established customers (Net 30 days, subject to credit approval), Large orders (Custom payment schedules available). All payments in USD unless otherwise agreed. Prices are subject to change without notice. Quoted prices are valid for 30 days unless otherwise specified.'
    },
    {
      id: '5',
      title: '5. Shipping and Delivery',
      content: 'Delivery dates are estimates only and are not guaranteed. We will make reasonable efforts to meet estimated delivery dates but shall not be liable for delays caused by: Force majeure events, Customs delays, Shipping carrier issues, Customer-requested changes, Raw material shortages. Risk of loss and title to products pass to the buyer upon delivery to the shipping carrier at our facility, unless otherwise agreed in writing. For international shipments, buyers are responsible for all customs duties, taxes, and import fees.'
    },
    {
      id: '6',
      title: '6. Returns and Refunds',
      content: 'Due to the custom nature of our products, returns are generally not accepted except in cases of: Manufacturing defects, Damage during shipping, Significant deviation from agreed specifications. Claims must be reported within 7 days of delivery with photographic evidence. We will investigate all valid claims and provide appropriate remedies, which may include: Replacement of defective items, Partial or full refund, Credit toward future orders.'
    },
    {
      id: '7',
      title: '7. Intellectual Property',
      content: 'The website and its original content, features, and functionality are owned by WOODZIRE LLC and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. For custom products based on customer designs: Customers retain ownership of their original designs, We obtain manufacturing rights for the duration of the project, Confidentiality agreements protect proprietary information, We will not reproduce customer designs for other clients without permission. The WOODZIRE name and logo are trademarks of WOODZIRE LLC.'
    },
    {
      id: '8',
      title: '8. Warranties and Disclaimers',
      content: 'We warrant that our products will be free from material defects in workmanship for a period of 90 days from delivery. This warranty does not cover: Normal wear and tear, Damage from misuse or abuse, Exposure to extreme environmental conditions, Modifications made by the customer. EXCEPT AS EXPRESSLY SET FORTH HEREIN, WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. Natural wood products may vary in grain, color, and texture. Such variations are inherent characteristics of wood and are not considered defects.'
    },
    {
      id: '9',
      title: '9. Limitation of Liability',
      content: 'IN NO EVENT SHALL WOODZIRE LLC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES. Our total liability for any claim arising out of or relating to these Terms or our services shall not exceed the amount paid by you for the specific products or services giving rise to the claim.'
    },
    {
      id: '10',
      title: '10. Indemnification',
      content: 'You agree to defend, indemnify, and hold harmless WOODZIRE LLC and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of our services.'
    },
    {
      id: '11',
      title: '11. Termination',
      content: 'We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use our services will cease immediately. Ongoing orders and contractual obligations will remain in effect according to their specific terms unless otherwise agreed in writing.'
    },
    {
      id: '12',
      title: '12. Dispute Resolution',
      content: 'In the event of any dispute, the parties agree to first attempt to resolve the matter through good faith negotiations. If negotiation fails, any dispute shall be resolved through binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association. You agree that any arbitration or legal proceeding shall be limited to the dispute between you and WOODZIRE LLC individually. You waive any right to participate in class action lawsuits or class-wide arbitrations.'
    },
    {
      id: '13',
      title: '13. Governing Law',
      content: 'These Terms shall be interpreted and governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Delaware.'
    },
    {
      id: '14',
      title: '14. Changes to Terms',
      content: 'We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.'
    },
    {
      id: '15',
      title: '15. Severability',
      content: 'If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.'
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <motion.div
          className="absolute top-10 right-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FileText className="w-16 h-16 text-gold mx-auto mb-6" />
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-4">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Effective Date: January 1, 2025 | Last Updated: January 1, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.p
            className="text-muted-foreground text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Welcome to WOODZIRE LLC ("Company," "we," "our," or "us"). These Terms and Conditions ("Terms") 
            govern your use of our website and services. By accessing or using our website or engaging with 
            our services, you agree to be bound by these Terms.
          </motion.p>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                viewport={{ once: true }}
                className="border-b border-border/30 pb-10 last:border-0"
              >
                <h2 className="font-display text-xl tracking-wider mb-4 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl tracking-wider mb-8">16. Contact Information</h2>
            <p className="text-muted-foreground mb-8">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-background rounded-xl border border-border/50">
                <h3 className="font-display text-lg mb-4">US Office</h3>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p className="font-semibold text-foreground">WOODZIRE LLC</p>
                  <p>8 The Green Ste B</p>
                  <p>Dover, Delaware 19901, USA</p>
                </div>
              </div>
              
              <div className="p-6 bg-background rounded-xl border border-border/50">
                <h3 className="font-display text-lg mb-4">Contact Details</h3>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p><Mail className="w-4 h-4 inline mr-2" />info@woodzire.llc</p>
                  <p><Phone className="w-4 h-4 inline mr-2" />+91-9528050221</p>
                  <p><Scale className="w-4 h-4 inline mr-2" />legal@woodzire.llc</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default TermsConditions;
