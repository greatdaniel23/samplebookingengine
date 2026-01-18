import { useEffect, useState } from 'react';
import { paths } from '@/config/paths';

interface GTMCode {
    id: string;
    container_id: string;
    name: string;
    enabled: boolean;
}

/**
 * GTMLoader - Fetches enabled GTM codes from the API and injects them into the document head.
 * This component should be mounted once at the root of the application.
 */
export function GTMLoader() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (loaded) return;

        const loadGTMCodes = async () => {
            try {
                const response = await fetch(paths.buildApiUrl('/gtm'));
                const data = await response.json();

                if (data.success && data.data?.gtm_codes) {
                    const enabledCodes = (data.data.gtm_codes as GTMCode[]).filter(c => c.enabled);

                    enabledCodes.forEach(code => {
                        // Inject GTM script (head)
                        const script = document.createElement('script');
                        script.innerHTML = `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${code.container_id}');
            `;
                        script.setAttribute('data-gtm-id', code.container_id);
                        document.head.appendChild(script);

                        // Inject GTM noscript (body)
                        const noscript = document.createElement('noscript');
                        const iframe = document.createElement('iframe');
                        iframe.src = `https://www.googletagmanager.com/ns.html?id=${code.container_id}`;
                        iframe.height = '0';
                        iframe.width = '0';
                        iframe.style.display = 'none';
                        iframe.style.visibility = 'hidden';
                        noscript.appendChild(iframe);
                        noscript.setAttribute('data-gtm-id', code.container_id);
                        document.body.insertBefore(noscript, document.body.firstChild);
                    });
                }
            } catch (error) {
                console.error('Failed to load GTM codes:', error);
            } finally {
                setLoaded(true);
            }
        };

        loadGTMCodes();
    }, [loaded]);

    return null; // This component doesn't render anything visible
}

export default GTMLoader;
