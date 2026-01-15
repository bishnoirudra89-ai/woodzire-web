import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Globe, Mail, Phone } from 'lucide-react';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: '1',
      title: '1. Information We Collect',
      content: [
        {
          subtitle: 'Personal Information',
          text: 'We may collect personal information that you voluntarily provide to us, including: Name and contact information (email address, phone number, mailing address), Business information (company name, industry, position), Order and inquiry details, Payment information (processed securely through third-party providers), Communication preferences.'
        },
        {
          subtitle: 'Automatically Collected Information',
          text: 'When you visit our website, we may automatically collect: IP address and location data, Browser type and version, Device information, Pages visited and time spent on our site, Referring website information.'
        }
      ]
    },
    {
      id: '2',
      title: '2. How We Use Your Information',
      content: [
        {
          text: 'We use the information we collect for the following purposes: Processing and fulfilling orders and inquiries, Providing customer support and communication, Improving our products and services, Personalizing your experience on our website, Sending marketing communications (with your consent), Complying with legal obligations, Protecting against fraud and security threats, Analyzing website usage and performance.'
        }
      ]
    },
    {
      id: '3',
      title: '3. Cookies and Tracking Technologies',
      content: [
        {
          subtitle: 'Types of Cookies We Use',
          text: 'Essential Cookies: Necessary for website functionality. Performance Cookies: Help us analyze website usage. Functional Cookies: Remember your preferences. Marketing Cookies: Used for targeted advertising (with consent). You can control cookie settings through your browser preferences. However, disabling certain cookies may affect website functionality.'
        }
      ]
    },
    {
      id: '4',
      title: '4. Third-Party Services',
      content: [
        {
          text: 'We may use third-party services that collect, monitor, and analyze information: Analytics Services (Google Analytics), Payment Processors, Email Services, Cloud Storage, Customer Support systems. These third parties have their own privacy policies and we encourage you to review them.'
        }
      ]
    },
    {
      id: '5',
      title: '5. Data Security',
      content: [
        {
          text: 'We implement appropriate technical and organizational measures to protect your personal information: SSL encryption for data transmission, Secure servers and databases, Regular security audits and updates, Access controls and employee training, Data backup and recovery procedures. While we strive to protect your information, no method of transmission over the internet is 100% secure.'
        }
      ]
    },
    {
      id: '6',
      title: '6. Data Sharing and Disclosure',
      content: [
        {
          text: 'We do not sell, trade, or rent your personal information. We may share your information in the following circumstances: With your explicit consent, To fulfill orders and provide services, With trusted service providers under confidentiality agreements, To comply with legal obligations or court orders, To protect our rights, property, or safety, In connection with business transfers or mergers.'
        }
      ]
    },
    {
      id: '7',
      title: '7. Your Rights and Choices',
      content: [
        {
          text: 'Depending on your location, you may have the following rights: Access (Request a copy of your personal information), Correction (Request correction of inaccurate information), Deletion (Request deletion of your personal information), Portability (Request transfer of your data), Restriction (Request limitation of processing), Objection (Object to certain types of processing), Withdraw Consent (Withdraw consent for marketing communications). To exercise these rights, please contact us using the information provided below.'
        }
      ]
    },
    {
      id: '8',
      title: '8. Data Retention',
      content: [
        {
          text: 'We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it.'
        }
      ]
    },
    {
      id: '9',
      title: '9. International Data Transfers',
      content: [
        {
          text: 'As a company operating internationally with manufacturing facilities in India and corporate presence in the United States, your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.'
        }
      ]
    },
    {
      id: '10',
      title: '10. Children\'s Privacy',
      content: [
        {
          text: 'Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.'
        }
      ]
    },
    {
      id: '11',
      title: '11. Changes to This Privacy Policy',
      content: [
        {
          text: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.'
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <motion.div
          className="absolute top-10 left-20 w-64 h-64 rounded-full bg-gold/5 blur-3xl"
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
            <Shield className="w-16 h-16 text-gold mx-auto mb-6" />
            <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-4">
              Privacy Policy
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
            WOODZIRE LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you visit our website 
            or engage with our services.
          </motion.p>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="border-b border-border/30 pb-12 last:border-0"
              >
                <h2 className="font-display text-2xl tracking-wider mb-6 text-foreground">
                  {section.title}
                </h2>
                {section.content.map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    {item.subtitle && (
                      <h3 className="font-semibold text-foreground mt-4">{item.subtitle}</h3>
                    )}
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                ))}
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
            <h2 className="font-display text-2xl tracking-wider mb-8">12. Contact Information</h2>
            <p className="text-muted-foreground mb-8">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
                  <p><Mail className="w-4 h-4 inline mr-2" />ashwinbishnoi051@gmail.com</p>
                  <p><Phone className="w-4 h-4 inline mr-2" />+91-9528050221</p>
                  <p><Lock className="w-4 h-4 inline mr-2" />privacy@woodzire.llc</p>
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

export default PrivacyPolicy;
