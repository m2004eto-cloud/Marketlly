/**
 * Marketly Policies & Procedures — drafted to align with UAE federal frameworks:
 * - Federal Law No. 15 of 2020 on Consumer Protection + Cabinet Resolution No. 66 of 2023
 * - Federal Decree-Law No. 14 of 2023 on Trading through Modern Technology (Digital Commerce)
 * - Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL)
 * - Federal Decree-Law No. 8 of 2017 on Value Added Tax (VAT) / FTA guidance
 * - UAE AML/CFT expectations for marketplace seller onboarding (trade licence + identity)
 *
 * This is platform policy text for the Marketly product demo — not a substitute for
 * licensed legal advice. Marketly LLC (UAE) should have counsel review before production use.
 */

export const LEGAL_VERSION = "2026.07.1";
export const LEGAL_EFFECTIVE_DATE = "23 July 2026";
export const PLATFORM_ENTITY = "Marketly Marketplace (UAE)";
export const PLATFORM_CONTACT = "legal@marketly.ae";
export const PLATFORM_SUPPORT = "support@marketly.ae";
export const PLATFORM_PHONE = "+971 4 000 0000";
export const PLATFORM_ADDRESS = "Dubai, United Arab Emirates";

export type LegalSection = { heading: string; body: string[] };

export type LegalDocument = {
  id: "terms" | "privacy" | "seller-policies";
  title: string;
  subtitle: string;
  sections: LegalSection[];
};

export const TERMS_OF_SERVICE: LegalDocument = {
  id: "terms",
  title: "Terms & Conditions",
  subtitle: `Version ${LEGAL_VERSION} · Effective ${LEGAL_EFFECTIVE_DATE}`,
  sections: [
    {
      heading: "1. Agreement & acceptance (mandatory)",
      body: [
        `These Terms & Conditions (“Terms”) form a binding agreement between you and ${PLATFORM_ENTITY} (“Marketly”, “we”, “us”) governing access to and use of the Marketly website, applications, and related services (the “Platform”).`,
        "By creating an account, checking the acceptance box, posting a listing, bidding in an auction, messaging another user, or otherwise using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and (if you are a Dealer) the Seller & KYC Policies.",
        "If you do not agree, you must not create an account or use the Platform. Acceptance is mandatory for all Customers and Dealers.",
      ],
    },
    {
      heading: "2. Governing law & regulatory framework",
      body: [
        "These Terms are governed by the laws of the United Arab Emirates. Without limiting other applicable rules, Marketly designs its policies to align with:",
        "• Federal Law No. 15 of 2020 on Consumer Protection and its Executive Regulations (Cabinet Resolution No. 66 of 2023);",
        "• Federal Decree-Law No. 14 of 2023 on Trading through Modern Technology (Digital Commerce Law);",
        "• Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data (PDPL);",
        "• Federal Decree-Law No. 8 of 2017 on Value Added Tax and Federal Tax Authority (FTA) guidance;",
        "• Applicable emirate licensing rules and UAE AML/CFT expectations for commercial sellers.",
        "Disputes shall be subject to the exclusive jurisdiction of the competent courts of Dubai, UAE, unless mandatory law requires otherwise.",
      ],
    },
    {
      heading: "3. Platform role (marketplace intermediary)",
      body: [
        "Marketly is an online classifieds and motors marketplace that enables Customers and Dealers to list, discover, chat about, and (where enabled) auction goods. Unless expressly stated otherwise, Marketly is not the seller of listed goods and is not a party to the sale contract between buyer and seller.",
        "Sellers are solely responsible for the accuracy of listings, title/ownership, condition, legality of goods, pricing disclosures, warranties they offer, invoicing, delivery/collection arrangements, and compliance with UAE consumer, tax, and licensing laws.",
        "Marketly may provide tools (chat, verification badges, moderation, subscriptions, auctions) but does not guarantee that any listing, user, or transaction is free of risk.",
      ],
    },
    {
      heading: "4. Eligibility & accounts",
      body: [
        "You must be at least 18 years old and legally capable of entering contracts under UAE law.",
        "You must provide accurate registration information and keep it updated. You are responsible for safeguarding login credentials and for all activity under your account.",
        "Customers may post personal ads subject to plan limits and Platform rules. Dealers must complete KYC and hold a valid UAE trade licence covering relevant trading/e-commerce activities before receiving a verified dealer status.",
        "Admin accounts are provisioned only by Marketly and are not available via public signup.",
      ],
    },
    {
      heading: "5. Mandatory pre-contract information & fair dealing",
      body: [
        "In line with UAE Consumer Protection and Digital Commerce expectations, sellers must present clear, non-misleading information before a consumer commits, including: identity/trade name, contact details, accurate description and material specifications, total price in AED (taxes and material fees disclosed where applicable), payment methods, delivery/collection terms, and any warranty or after-sales conditions.",
        "Prohibited practices include price concealment, forced bundling, bait advertising, fake scarcity, impersonation, and any term that unlawfully strips consumers of rights granted by UAE Consumer Protection Law.",
        "Arabic information may be required for certain consumer-facing disclosures under UAE law. Where Marketly provides bilingual UI, sellers remain responsible for accurate Arabic content where legally required for their offers.",
      ],
    },
    {
      heading: "6. Listings, content & prohibited items",
      body: [
        "You may only list goods you are legally entitled to sell. Listings must be truthful, complete, and not misleading. Images must reasonably represent the actual item.",
        "Strictly prohibited: illegal goods/services; stolen property; weapons and controlled items without lawful authority; counterfeit goods; fraud schemes; content that is discriminatory, harassing, obscene, or that infringes IP or privacy rights.",
        "Marketly may refuse, remove, delay, or limit listings or accounts that violate these Terms, applicable law, or community safety standards, and may retain records as required for investigations.",
      ],
    },
    {
      heading: "7. Chat, contact & safety",
      body: [
        "In-app messaging is provided to facilitate legitimate enquiries. Do not share one-time passwords (OTPs), full card details, or remote-access credentials. Prefer public meeting places and document verification for motors and high-value goods.",
        "Marketly may monitor or review reported chats for safety, fraud prevention, and legal compliance. Abusive, threatening, or scam-related communications may result in suspension.",
      ],
    },
    {
      heading: "8. Auctions (where enabled)",
      body: [
        "Auction features, when enabled for your account, are subject to auction-specific rules displayed on the auction page (start/end times, reserve, bid increments). Bids may be binding subject to those rules and applicable law.",
        "Shill bidding, bid manipulation, and false lot descriptions are prohibited and may lead to permanent bans and referral to authorities.",
      ],
    },
    {
      heading: "9. Subscriptions, fees & VAT",
      body: [
        "Subscription plans, ad quotas, and featured placements are described at purchase/upgrade. Prices shown on the Platform are in AED. Where VAT applies, Marketly will disclose VAT treatment in accordance with FTA rules for its own services.",
        "Dealers remain responsible for their own VAT registration when taxable supplies meet FTA thresholds (mandatory registration generally applies when taxable supplies exceed AED 375,000 in a 12-month period, subject to FTA rules), and for issuing compliant tax invoices for their sales.",
        "Fees already consumed (e.g. used ad slots in an active period) are generally non-refundable except where required by mandatory UAE consumer law or where Marketly cancels a paid feature without substitute.",
      ],
    },
    {
      heading: "10. Payments between users",
      body: [
        "Unless Marketly expressly offers a payment escrow or gateway for a specific feature, payment for goods is arranged directly between buyer and seller. Marketly is not responsible for offline payments, cheque fraud, or chargebacks between users.",
        "Users should use traceable methods and obtain receipts. For Dealer sales, insist on proper commercial documentation.",
      ],
    },
    {
      heading: "11. Intellectual property",
      body: [
        "Marketly’s branding, software, and Platform content are protected. You retain ownership of content you upload, and grant Marketly a non-exclusive licence to host, display, moderate, and promote that content on the Platform for operating and improving the service.",
        "Do not upload content that infringes third-party IP. Rights holders may report infringement to the Platform contact below.",
      ],
    },
    {
      heading: "12. Complaints, returns & disputes between users",
      body: [
        "Sellers must honour any return, exchange, or warranty terms they advertise, and must not include unfair/harmful terms that unlawfully exclude mandatory consumer rights under UAE law.",
        "Buyers should first attempt good-faith resolution with the seller via Platform chat. Marketly may, at its discretion, assist with mediation tools or account actions for policy breaches, but is not obliged to resolve private sale disputes or pay compensation for user-to-user transactions.",
        "You may also escalate consumer complaints to competent UAE authorities where applicable.",
      ],
    },
    {
      heading: "13. Suspension, termination & changes",
      body: [
        "Marketly may suspend or terminate accounts for breach of these Terms, legal risk, fraud indicators, or prolonged inactivity.",
        "Material updates to these Terms will be published on the Platform with a new version number and effective date. Continued use after the effective date constitutes acceptance of the updated Terms. Where UAE Consumer Protection rules restrict unilateral harmful changes, Marketly will not rely on void unfair terms and will provide notice of material changes affecting consumer rights.",
      ],
    },
    {
      heading: "14. Liability",
      body: [
        "To the fullest extent permitted by UAE law, Marketly is not liable for indirect or consequential losses arising from user-to-user transactions, listing inaccuracies by sellers, or downtime beyond reasonable control.",
        "Nothing in these Terms excludes liability that cannot be excluded under mandatory UAE law, including liability for fraud or wilful misconduct by Marketly.",
      ],
    },
    {
      heading: "15. Contact",
      body: [
        `Legal: ${PLATFORM_CONTACT}`,
        `Support: ${PLATFORM_SUPPORT} · ${PLATFORM_PHONE}`,
        `Address: ${PLATFORM_ADDRESS}`,
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Privacy Policy",
  subtitle: `Version ${LEGAL_VERSION} · Effective ${LEGAL_EFFECTIVE_DATE} · PDPL-aligned`,
  sections: [
    {
      heading: "1. Who we are",
      body: [
        `${PLATFORM_ENTITY} processes personal data in connection with the Platform. For PDPL purposes, Marketly acts as a data controller for account, KYC, and Platform operations data.`,
        `Contact for privacy requests: ${PLATFORM_CONTACT}`,
      ],
    },
    {
      heading: "2. Data we collect",
      body: [
        "Account data: name, email, phone, role (customer/dealer), password (stored securely), subscription and usage data.",
        "Dealer KYC data: trade licence details, issuing authority, licence expiry, VAT TRN (if provided), authorised signatory identity details, business address, and related verification notes.",
        "Listings & transactions metadata: ads you post, chat messages, auction activity, reports, device/browser technical logs reasonably needed for security.",
        "We do not ask for unnecessary sensitive personal data. Do not upload special-category data unless strictly required for a lawful purpose.",
      ],
    },
    {
      heading: "3. Purposes & legal bases (PDPL)",
      body: [
        "We process data to: create and secure accounts; provide marketplace, chat, and subscription features; verify dealers (KYC/AML risk controls); prevent fraud and abuse; comply with UAE legal obligations; and improve Platform safety and performance.",
        "Bases include: performance of a contract; legitimate interests in securing the Platform (balanced against your rights); consent (e.g. optional marketing); and legal obligation where applicable.",
      ],
    },
    {
      heading: "4. Marketing consent",
      body: [
        "We will not use your personal data for promotional marketing communications unless you give clear consent (or another PDPL-valid basis applies). You may withdraw marketing consent at any time via support channels without affecting other processing needed to run your account.",
      ],
    },
    {
      heading: "5. Sharing",
      body: [
        "We may share data with: other users as needed to operate listings/chat (e.g. your display name on an ad); service providers under confidentiality (hosting, analytics, support); professional advisers; and competent authorities when required by UAE law or to protect rights, safety, and fraud investigations.",
        "We do not sell personal data.",
      ],
    },
    {
      heading: "6. Cross-border transfers",
      body: [
        "If data is transferred outside the UAE, Marketly will take steps consistent with PDPL requirements for adequate protection or appropriate safeguards.",
      ],
    },
    {
      heading: "7. Retention & security",
      body: [
        "We retain account and KYC records for as long as your account is active and for a reasonable period thereafter for dispute resolution, audit, AML, and legal retention needs, then delete or anonymise where feasible.",
        "We apply administrative and technical measures appropriate to the risk. No method of transmission or storage is perfectly secure; please use a strong unique password.",
      ],
    },
    {
      heading: "8. Your rights",
      body: [
        "Subject to PDPL conditions and exemptions, you may request access, correction, deletion, restriction, or objection, and you may lodge a complaint with the competent UAE data office where applicable.",
        `Submit requests to ${PLATFORM_CONTACT}. We may need to verify your identity before responding.`,
      ],
    },
    {
      heading: "9. Updates",
      body: [
        "We may update this Privacy Policy to reflect legal or operational changes. The version number and effective date will be revised. Material changes will be notified via the Platform or email where appropriate.",
      ],
    },
  ],
};

export const SELLER_KYC_POLICIES: LegalDocument = {
  id: "seller-policies",
  title: "Seller Policies & KYC Procedures",
  subtitle: `Version ${LEGAL_VERSION} · Effective ${LEGAL_EFFECTIVE_DATE} · Mandatory for Dealers`,
  sections: [
    {
      heading: "1. Purpose",
      body: [
        "These Seller & KYC Policies set Marketly’s procedures for onboarding Dealers, verifying commercial identity, and maintaining a safe, lawful marketplace consistent with UAE Digital Commerce, Consumer Protection, VAT, and AML/CFT expectations.",
        "Acceptance of these Policies is mandatory to create a Dealer account. Incomplete or false KYC may result in rejection, suspension, or referral to authorities.",
      ],
    },
    {
      heading: "2. Who must complete KYC",
      body: [
        "All Dealer accounts must complete the Marketly KYC Form at signup. Customers posting occasional personal ads are not Dealers, but must still accept the Terms & Privacy Policy.",
        "Marketly may request refreshed KYC at any time (licence expiry, ownership change, risk alert, or periodic review).",
      ],
    },
    {
      heading: "3. Required KYC information",
      body: [
        "Dealers must provide, as a minimum:",
        "• Legal company name and trade name;",
        "• Valid UAE trade licence number, issuing authority (mainland DED/DET or recognised free zone), and licence expiry date;",
        "• Confirmation that licensed activities cover trading / e-commerce / motors or the categories you intend to sell;",
        "• VAT TRN (15 digits) if registered — mandatory when FTA thresholds require registration;",
        "• Authorised signatory full name and Emirates ID or passport number;",
        "• UAE mobile number and business address (emirate/city);",
        "• Declaration that information and documents are true, complete, and not misleading.",
        "Marketly may later require uploads of licence copies, ID, VAT certificate, and corporate bank proof for enhanced verification (aligned with common UAE marketplace onboarding practice).",
      ],
    },
    {
      heading: "4. Verification outcomes",
      body: [
        "After submission, KYC status is typically “pending” until Marketly reviews. Marketly may approve (verified), request more information, or reject.",
        "Verified badges and certain Dealer tools may remain limited until KYC is approved. Listing of commercial inventory while knowingly using an expired or mismatched licence is prohibited.",
      ],
    },
    {
      heading: "5. Dealer conduct & consumer obligations",
      body: [
        "Dealers must: publish accurate ads; disclose material defects; show all-in pricing practices consistent with UAE consumer rules; respond to enquiries in good faith; honour stated warranties; and avoid unfair/harmful contract terms void under Consumer Protection regulations.",
        "Dealers must not list prohibited or counterfeit goods, engage in review manipulation, or misuse chat for fraud.",
      ],
    },
    {
      heading: "6. Tax & invoicing",
      body: [
        "Dealers are solely responsible for UAE VAT compliance, including registration when required, charging VAT correctly, and issuing FTA-compliant tax invoices for taxable supplies.",
        "Marketly’s subscription invoices (if any) are separate from the Dealer’s own sales invoices to buyers.",
      ],
    },
    {
      heading: "7. Sanctions, AML & record-keeping",
      body: [
        "Dealers represent that they are not subject to applicable sanctions and that funds/goods are from lawful sources. Marketly may screen information and freeze features where risk indicators appear.",
        "Dealers should retain transaction records as required by UAE law and cooperate with lawful information requests.",
      ],
    },
    {
      heading: "8. Enforcement",
      body: [
        "Breaches may lead to listing removal, loss of verified status, suspension, termination, forfeiture of unused paid features where permitted by law, and reporting to competent authorities.",
      ],
    },
    {
      heading: "9. Contact",
      body: [
        `KYC / compliance: ${PLATFORM_CONTACT}`,
        `Support: ${PLATFORM_SUPPORT}`,
      ],
    },
  ],
};

export function getLegalDocument(id: LegalDocument["id"]): LegalDocument {
  if (id === "privacy") return PRIVACY_POLICY;
  if (id === "seller-policies") return SELLER_KYC_POLICIES;
  return TERMS_OF_SERVICE;
}
