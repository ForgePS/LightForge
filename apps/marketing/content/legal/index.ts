/**
 * Legal content — maintained separately from Vue UI components.
 * Replace placeholder sections with counsel-approved text before production launch.
 */

export type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type LegalDocument = {
  slug: 'privacy' | 'terms'
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
}

export const privacyPolicy: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  description: 'How LightForge handles information on the public marketing website and in the LightForge application.',
  lastUpdated: '2026-09-01',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'This Privacy Policy describes how LightForge ("LightForge," "we," "us," or "our") collects, uses, and shares information when you visit our public marketing website at www.lightforgecrm.com or use the LightForge application at app.lightforgecrm.com.',
        'This document is a structural placeholder for counsel review. It must be replaced or approved by qualified legal counsel before production reliance.'
      ]
    },
    {
      id: 'information-we-collect',
      title: 'Information We Collect',
      paragraphs: [
        'Marketing website: When you submit a demo request, contact form, or similar inquiry, we may collect information you provide such as your name, company name, email address, phone number, and message content.',
        'Application: When you use the LightForge SaaS platform, we process account, customer, job, and operational data submitted by your organization in connection with the service.',
        'Technical data: We may collect standard log and device information necessary to operate, secure, and improve our websites and services.'
      ]
    },
    {
      id: 'how-we-use',
      title: 'How We Use Information',
      paragraphs: [
        'We use information to respond to inquiries, provide and improve the LightForge platform, secure our services, communicate with users, and comply with legal obligations.',
        'We do not sell personal information through the marketing website forms described on this page.'
      ]
    },
    {
      id: 'sharing',
      title: 'How We Share Information',
      paragraphs: [
        'We may share information with service providers that help us operate the website, application, infrastructure, and support functions, subject to appropriate contractual protections.',
        'We may disclose information if required by law or to protect rights, safety, and security.'
      ]
    },
    {
      id: 'retention',
      title: 'Data Retention',
      paragraphs: [
        'We retain information for as long as needed to fulfill the purposes described in this policy, unless a longer retention period is required or permitted by law.'
      ]
    },
    {
      id: 'security',
      title: 'Security',
      paragraphs: [
        'We implement administrative, technical, and organizational measures designed to protect information. No method of transmission or storage is completely secure.',
        'For more detail on platform security practices, see our Security page.'
      ]
    },
    {
      id: 'your-choices',
      title: 'Your Choices',
      paragraphs: [
        'You may contact us regarding access, correction, or deletion requests where applicable. Application users should contact their organization administrator for workspace-related requests.'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Similar Technologies',
      paragraphs: [
        'The marketing website may use essential cookies required for basic site operation. Non-essential analytics or advertising cookies will only be enabled with appropriate notice and consent when configured.',
        'See the Cookie Policy section below for additional detail.'
      ]
    },
    {
      id: 'cookies-policy',
      title: 'Cookie Policy',
      paragraphs: [
        'Essential cookies: Used for core website functionality and security where applicable.',
        'Analytics cookies: Not enabled by default on the marketing site unless explicitly configured and disclosed.',
        'Advertising cookies: Not enabled by default on the marketing site unless explicitly configured and disclosed.',
        'You can manage browser cookie settings directly. If consent controls are enabled in the future, preferences will be stored according to the configured consent mechanism.'
      ]
    },
    {
      id: 'children',
      title: 'Children',
      paragraphs: [
        'LightForge services are intended for business use and are not directed to children.'
      ]
    },
    {
      id: 'changes',
      title: 'Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page will reflect the latest revision.'
      ]
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Questions about this Privacy Policy may be submitted through the Contact page at www.lightforgecrm.com/contact.'
      ]
    }
  ]
}

export const termsOfService: LegalDocument = {
  slug: 'terms',
  title: 'Terms of Service',
  description: 'Terms governing use of the LightForge marketing website and SaaS platform.',
  lastUpdated: '2026-09-01',
  sections: [
    {
      id: 'agreement',
      title: 'Agreement to Terms',
      paragraphs: [
        'These Terms of Service ("Terms") govern your access to and use of LightForge websites, applications, and related services.',
        'This document is a structural placeholder for counsel review. It must be replaced or approved by qualified legal counsel before production reliance.'
      ]
    },
    {
      id: 'services',
      title: 'Services',
      paragraphs: [
        'LightForge provides a software platform for professional lighting companies. Features, availability, and pricing may vary by plan and agreement.',
        'The public marketing website provides product information and lead capture forms. The authenticated application provides operational software for customer organizations.'
      ]
    },
    {
      id: 'accounts',
      title: 'Accounts and Access',
      paragraphs: [
        'Access to the LightForge application requires an authorized account. You are responsible for maintaining the confidentiality of account credentials and for activity under your account.'
      ]
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use',
      paragraphs: [
        'You agree not to misuse the services, interfere with their operation, attempt unauthorized access, or use the services in violation of applicable law or agreement.'
      ]
    },
    {
      id: 'customer-data',
      title: 'Customer Data',
      paragraphs: [
        'Organizations using LightForge may submit customer, job, and operational data into the platform. Each organization is responsible for the data it submits and for obtaining necessary permissions.',
        'Data processing terms, including any data processing addendum, will be provided as part of the applicable customer agreement when applicable.'
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      paragraphs: [
        'LightForge and its licensors retain all rights in the platform, websites, branding, and related materials, except for rights expressly granted to customers under applicable agreement.'
      ]
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      paragraphs: [
        'Services are provided on an "as is" and "as available" basis to the extent permitted by law. LightForge disclaims warranties not expressly stated in a written agreement.'
      ]
    },
    {
      id: 'limitation',
      title: 'Limitation of Liability',
      paragraphs: [
        'To the extent permitted by law, LightForge’s liability is limited as set forth in the applicable customer agreement or, for website-only use, to the maximum extent permitted by applicable law.'
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      paragraphs: [
        'We may suspend or terminate access for violations of these Terms or applicable agreement. Customers may terminate according to their subscription terms.'
      ]
    },
    {
      id: 'changes',
      title: 'Changes',
      paragraphs: [
        'We may update these Terms from time to time. Continued use after changes become effective constitutes acceptance where permitted by law.'
      ]
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'Questions about these Terms may be submitted through the Contact page at www.lightforgecrm.com/contact.'
      ]
    }
  ]
}
