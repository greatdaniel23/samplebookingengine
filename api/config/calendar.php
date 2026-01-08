<?php
// Calendar configuration constants
// Central flags controlling calendar export & booking enforcement
return [
    // Export pending bookings in iCal feed as STATUS:TENTATIVE
    'include_pending_in_feed' => true,

    // Allow admin to force booking over external block (logged) - keep false for safety
    'allow_external_override' => false,

    // External calendar sources currently imported
    'external_sources' => ['airbnb'],

    // Future: default retention months for external_blocks purge
    'external_retention_months' => 18,
];
