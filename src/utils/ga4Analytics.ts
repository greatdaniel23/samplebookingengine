/**
 * GA4 Analytics Tracking Utility
 * Pushes events to dataLayer for Google Tag Manager / GA4 conversion tracking.
 */

// Extend Window interface for dataLayer
declare global {
    interface Window {
        dataLayer: any[];
    }
}

// Ensure dataLayer exists
const getDataLayer = (): any[] => {
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        return window.dataLayer;
    }
    return [];
};

/**
 * Track a generic GA4 event
 */
export function trackEvent(eventName: string, eventParams: Record<string, any> = {}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: eventName,
        ...eventParams,
    });
    console.log('📊 GA4 Event:', eventName, eventParams);
}

/**
 * Track payment initiation (begin_checkout)
 * Use this when user clicks the "Pay Now" button
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackBeginCheckout(params: {
    value: number;
    currency?: string;
    booking_reference?: string;
    item_name?: string;
    item_id?: string;
    item_category?: string;
    customer_email?: string;
}) {
    const dataLayer = getDataLayer();
    // Clear previous ecommerce data
    dataLayer.push({ ecommerce: null });
    // Use raw integer value only - no formatting, no decimals
    // This prevents any locale-based interpretation issues in GA4
    const rawValue = Math.round(Number(params.value) || 0);
    dataLayer.push({
        event: 'begin_checkout',
        booking_reference: params.booking_reference,
        customer_email: params.customer_email,
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawValue,
            items: [{
                item_id: params.item_id || params.booking_reference || 'unknown',
                item_name: params.item_name || 'Booking',
                item_category: params.item_category || 'Package',
                price: rawValue,
                quantity: 1,
            }],
        },
    });
    console.log('📊 GA4 Event: begin_checkout', { ...params, raw_value: rawValue });
}

/**
 * Track successful payment/purchase (purchase)
 * Use this after payment is confirmed
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackPurchase(params: {
    transaction_id: string;
    value: number;
    currency?: string;
    item_name?: string;
    item_id?: string;
    item_category?: string;
}) {
    const dataLayer = getDataLayer();
    // Clear previous ecommerce data
    dataLayer.push({ ecommerce: null });
    // Use raw integer value only - no formatting, no decimals
    const rawValue = Math.round(Number(params.value) || 0);

    // Push new ecommerce event with proper structure
    dataLayer.push({
        event: 'purchase',
        ecommerce: {
            transaction_id: params.transaction_id,
            currency: params.currency || 'IDR',
            value: rawValue,
            items: [{
                item_id: params.item_id || params.transaction_id,
                item_name: params.item_name || 'Booking',
                item_category: params.item_category || 'Package',
                price: rawValue,
                quantity: 1,
            }],
        },
    });
    console.log('📊 GA4 Event: purchase', { ...params, raw_value: rawValue });
}

/**
 * Track booking form submission (generate_lead)
 */
export function trackBookingSubmission(params: {
    value: number;
    currency?: string;
    booking_reference: string;
}) {
    trackEvent('generate_lead', {
        value: params.value,
        currency: params.currency || 'IDR',
        booking_reference: params.booking_reference,
    });
}

/**
 * Track view_item - When user views a package or room details page
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackViewItem(params: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    currency?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawValue = Math.round(Number(params.price) || 0);
    dataLayer.push({
        event: 'view_item',
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawValue,
            items: [{
                item_id: params.item_id,
                item_name: params.item_name,
                item_category: params.item_category,
                price: rawValue,
                quantity: 1,
            }],
        },
    });
    console.log('📊 GA4 Event: view_item', params);
}

/**
 * Track select_item - When user clicks on a package card or selects a room
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackSelectItem(params: {
    item_id: string;
    item_name: string;
    item_list_name: string;
    item_category?: string;
    price?: number;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawValue = Math.round(Number(params.price) || 0);
    dataLayer.push({
        event: 'select_item',
        ecommerce: {
            item_list_name: params.item_list_name,
            items: [{
                item_id: params.item_id,
                item_name: params.item_name,
                item_category: params.item_category || 'Package',
                price: rawValue,
                quantity: 1,
            }],
        },
    });
    console.log('📊 GA4 Event: select_item', params);
}

/**
 * Track add_to_cart - When user adds a room to their booking
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackAddToCart(params: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
    currency?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawPrice = Math.round(Number(params.price) || 0);
    const rawTotal = rawPrice * params.quantity;
    dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawTotal,
            items: [{
                item_id: params.item_id,
                item_name: params.item_name,
                item_category: params.item_category,
                price: rawPrice,
                quantity: params.quantity,
            }],
        },
    });
    console.log('📊 GA4 Event: add_to_cart', params);
}

/**
 * Track remove_from_cart - When user removes a room from their booking
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackRemoveFromCart(params: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    quantity: number;
    currency?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawPrice = Math.round(Number(params.price) || 0);
    const rawTotal = rawPrice * params.quantity;
    dataLayer.push({
        event: 'remove_from_cart',
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawTotal,
            items: [{
                item_id: params.item_id,
                item_name: params.item_name,
                item_category: params.item_category,
                price: rawPrice,
                quantity: params.quantity,
            }],
        },
    });
    console.log('📊 GA4 Event: remove_from_cart', params);
}

/**
 * Track view_cart - When user views the booking summary page
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackViewCart(params: {
    value: number;
    currency?: string;
    items: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }>;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawTotal = Math.round(Number(params.value) || 0);
    dataLayer.push({
        event: 'view_cart',
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawTotal,
            items: params.items.map(item => ({
                item_id: item.item_id,
                item_name: item.item_name,
                price: Math.round(Number(item.price) || 0),
                quantity: item.quantity,
            })),
        },
    });
    console.log('📊 GA4 Event: view_cart', params);
}

/**
 * Track add_payment_info - When user selects payment method
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackAddPaymentInfo(params: {
    value: number;
    currency?: string;
    payment_type: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    const rawTotal = Math.round(Number(params.value) || 0);
    dataLayer.push({
        event: 'add_payment_info',
        ecommerce: {
            currency: params.currency || 'IDR',
            value: rawTotal,
            payment_type: params.payment_type,
        },
    });
    console.log('📊 GA4 Event: add_payment_info', params);
}

/**
 * Track search - When user searches for packages/rooms
 */
export function trackSearch(params: {
    search_term: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'search',
        search_term: params.search_term,
        check_in: params.check_in,
        check_out: params.check_out,
        guests: params.guests,
    });
    console.log('📊 GA4 Event: search', params);
}

/**
 * Track view_item_list - When user views a list of packages
 * Uses proper GA4 ecommerce data layer structure
 */
export function trackViewItemList(params: {
    item_list_name: string;
    items: Array<{
        item_id: string;
        item_name: string;
        item_category?: string;
        price?: number;
    }>;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({ ecommerce: null });
    dataLayer.push({
        event: 'view_item_list',
        ecommerce: {
            item_list_name: params.item_list_name,
            items: params.items.map((item, index) => ({
                item_id: item.item_id,
                item_name: item.item_name,
                item_category: item.item_category || 'Package',
                price: Math.round(Number(item.price) || 0),
                quantity: 1,
                index: index,
            })),
        },
    });
    console.log('📊 GA4 Event: view_item_list', params);
}

// ============================================
// PAGE-SPECIFIC DATA LAYER VARIABLES
// ============================================

/**
 * Track page view with page-specific data
 * Pushes page_type and page_data to dataLayer for GTM
 */
export function trackPageView(params: {
    page_type: 'homepage' | 'packages' | 'book' | 'confirmation' | 'package_details' | 'room_details';
    page_title: string;
    page_path?: string;
    page_data?: Record<string, any>;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: params.page_type,
        page_title: params.page_title,
        page_path: params.page_path || (typeof window !== 'undefined' ? window.location.pathname : ''),
        page_data: params.page_data || {},
    });
    console.log('📊 GA4 Page View:', params);
}

/**
 * Track Homepage view
 */
export function trackHomepage() {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'homepage',
        page_title: 'Homepage',
        page_path: '/',
        page_data: {
            section: 'landing',
        },
    });
    console.log('📊 GA4 Page: Homepage');
}

/**
 * Track Packages listing page
 */
export function trackPackagesPage(params?: {
    total_packages?: number;
    filter_type?: string;
    check_in?: string;
    check_out?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'packages',
        page_title: 'Packages',
        page_path: '/packages',
        page_data: {
            total_packages: params?.total_packages || 0,
            filter_type: params?.filter_type || 'all',
            check_in: params?.check_in || null,
            check_out: params?.check_out || null,
        },
    });
    console.log('📊 GA4 Page: Packages', params);
}

/**
 * Track Book page (booking form)
 */
export function trackBookPage(params: {
    package_id?: string;
    package_name?: string;
    room_id?: string;
    room_name?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    price?: number;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'book',
        page_title: 'Book',
        page_path: '/book',
        page_data: {
            package_id: params.package_id || null,
            package_name: params.package_name || null,
            room_id: params.room_id || null,
            room_name: params.room_name || null,
            check_in: params.check_in || null,
            check_out: params.check_out || null,
            guests: params.guests || 1,
            price: Math.round(Number(params.price) || 0),
        },
    });
    console.log('📊 GA4 Page: Book', params);
}

/**
 * Track Confirmation page (after successful booking)
 */
export function trackConfirmationPage(params: {
    booking_reference: string;
    transaction_id?: string;
    package_name?: string;
    room_name?: string;
    total_amount: number;
    currency?: string;
    guest_email?: string;
    check_in?: string;
    check_out?: string;
    payment_status?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'confirmation',
        page_title: 'Booking Confirmation',
        page_path: `/confirmation/${params.booking_reference}`,
        page_data: {
            booking_reference: params.booking_reference,
            transaction_id: params.transaction_id || params.booking_reference,
            package_name: params.package_name || null,
            room_name: params.room_name || null,
            total_amount: Math.round(Number(params.total_amount) || 0),
            currency: params.currency || 'IDR',
            guest_email: params.guest_email || null,
            check_in: params.check_in || null,
            check_out: params.check_out || null,
            payment_status: params.payment_status || 'pending',
        },
    });
    console.log('📊 GA4 Page: Confirmation', params);
}

/**
 * Track Package Details page
 */
export function trackPackageDetailsPage(params: {
    package_id: string;
    package_name: string;
    price: number;
    currency?: string;
    package_type?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'package_details',
        page_title: params.package_name,
        page_path: `/packages/${params.package_id}`,
        page_data: {
            package_id: params.package_id,
            package_name: params.package_name,
            price: Math.round(Number(params.price) || 0),
            currency: params.currency || 'IDR',
            type: params.package_type || 'General',
        },
    });
    console.log('📊 GA4 Page: Package Details', params);
}

/**
 * Track Room Details page
 */
export function trackRoomDetailsPage(params: {
    room_id: string;
    room_name: string;
    price: number;
    currency?: string;
    capacity?: number;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_type: 'room_details',
        page_title: params.room_name,
        page_path: `/rooms/${params.room_id}`,
        page_data: {
            room_id: params.room_id,
            room_name: params.room_name,
            price: Math.round(Number(params.price) || 0),
            currency: params.currency || 'IDR',
            capacity: params.capacity || 2,
        },
    });
    console.log('📊 GA4 Page: Room Details', params);
}

/**
 * Track generic button clicks with context
 * Captures: package name, check dates, value, room name
 */
export function trackButtonClick(params: {
    button_name: string;
    page_location?: string;
    package_name?: string;
    package_id?: string;
    room_name?: string;
    check_in?: string;
    check_out?: string;
    value?: number;
    currency?: string;
}) {
    const dataLayer = getDataLayer();
    dataLayer.push({
        event: 'button_click',
        button_name: params.button_name,
        page_location: params.page_location || (typeof window !== 'undefined' ? window.location.pathname : ''),
        ...params,
        value: params.value ? Math.round(Number(params.value)) : undefined
    });
    console.log('📊 GA4 Button Click:', params);
}

export default {
    trackEvent,
    trackBeginCheckout,
    trackPurchase,
    trackBookingSubmission,
    trackViewItem,
    trackSelectItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackViewCart,
    trackAddPaymentInfo,
    trackSearch,
    trackViewItemList,
    // Page tracking
    trackPageView,
    trackHomepage,
    trackPackagesPage,
    trackBookPage,
    trackConfirmationPage,
    trackPackageDetailsPage,
    trackRoomDetailsPage,
    trackButtonClick,
};
