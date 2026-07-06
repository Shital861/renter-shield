TENANT_RIGHTS: dict[str, dict[str, str]] = {
    "CA": {
        "heating": "Landlords must provide heating facilities capable of maintaining a temperature of at least 70 degrees Fahrenheit in all habitable rooms.",
        "mold": "Landlords must remediate mold that exceeds permissible exposure limits or poses a health hazard, after receiving written notice.",
        "eviction": "Eviction requires a written notice (e.g., 3-day notice to pay or quit) and a court order via unlawful detainer; self-help eviction is illegal.",
        "entry_notice": "Landlords must provide at least 24 hours written notice before entering the rental unit, except in cases of emergency or abandonment.",
        "deposit": "Security deposits must be returned within 21 days after tenancy termination, with an itemized statement for any deductions.",
    },
    "NY": {
        "heating": "Heat must be provided from October 1 through May 31. If outdoor temperature falls below 55°F during the day, indoor temperature must be at least 68°F.",
        "mold": "The Warranty of Habitability requires landlords to keep apartments free of indoor mold hazards. Remediation must follow NYC local laws.",
        "eviction": "A landlord cannot evict a tenant without a court proceeding. Proper written notice (e.g., 14-day rent demand) must be served first.",
        "entry_notice": "A landlord must provide reasonable notice (usually 24 hours for inspection, 1 week for repairs) before entering the apartment.",
        "deposit": "Security deposits must be returned within 14 days of the tenant vacating, with an itemized list of any deductions.",
    },
    "TX": {
        "heating": "Landlords are obligated to repair heating systems if the condition materially affects the physical health or safety of an ordinary tenant.",
        "mold": "Landlords must make a diligent effort to remediate mold if it is a condition affecting health or safety, provided the tenant is current on rent.",
        "eviction": "Landlords must provide a 3-day written notice to vacate before filing eviction, unless the lease specifies a different notice period.",
        "entry_notice": "Texas law has no statutory notice requirement for entry, but the lease agreement typically dictates entry conditions (usually 24 hours notice).",
        "deposit": "Security deposits must be refunded within 30 days of surrender of the premises, unless deductions are itemized.",
    },
    "FL": {
        "heating": "Landlords must make reasonable provisions for heat during winter, keeping the premises in a habitable condition.",
        "mold": "Landlords must maintain the dwelling unit in accordance with housing codes, which includes preventing and addressing moisture and mold issues.",
        "eviction": "For nonpayment of rent, landlords must give a 3-day notice. For other violations, a 7-day notice is required before eviction.",
        "entry_notice": "Landlords must give at least 12 hours notice for entry to make repairs, and entry must be at a reasonable time (7:30 AM to 8:00 PM).",
        "deposit": "Landlords must return deposits within 15 days, or send a notice of claim against the deposit within 30 days.",
    },
    "WA": {
        "heating": "Landlords must maintain heating and plumbing fixtures in good working order. Heat must be supplied to all habitable rooms.",
        "mold": "Landlords must maintain the property to prevent moisture accumulation and must remediate mold conditions that violate housing codes.",
        "eviction": "A 14-day notice to pay or vacate is required for nonpayment. Self-help evictions are strictly prohibited under state law.",
        "entry_notice": "Landlords must give a 2-day notice of intent to enter for inspections or repairs, and a 1-day notice for showing to prospective buyers/tenants.",
        "deposit": "Security deposits must be returned within 30 days of lease termination, along with an itemized statement detailing any deductions.",
    },
}
