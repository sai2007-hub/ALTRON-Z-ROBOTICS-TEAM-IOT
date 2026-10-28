import React, { useEffect } from 'react';
import { PageView } from '../layout/Navbar';

interface SEOManagerProps {
  currentView: PageView;
}

interface PageMeta {
  title: string;
  description: string;
  robots: string;
  ogType: string;
  schema?: Record<string, any>;
}

// Canonical Base URL resolution:
// If custom production domain is provided via VITE_SITE_URL (e.g. https://altronz.org), use it.
// Otherwise, dynamically fallback to the browser's current window.location.origin.
export const getProductionDomain = (): string => {
  if (typeof window !== 'undefined') {
    const envUrl = (import.meta as any).env?.VITE_SITE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
      return envUrl.replace(/\/$/, '');
    }
    return window.location.origin;
  }
  return 'https://YOUR_PRODUCTION_DOMAIN';
};

const getPageMetadata = (view: PageView, domain: string): PageMeta => {
  const brandSuffix = "ALTRON'Z ROBOTICS TEAM & IOT";
  const absoluteOgImage = `${domain}/og-image.png`;
  const baseCanonical = `${domain}/${view === 'home' ? '' : '#' + view}`;

  switch (view) {
    case 'about':
      return {
        title: `About Our Team & Mission | ${brandSuffix}`,
        description: `Discover ALTRON'Z ROBOTICS TEAM & IOT. Founded by engineering undergraduates, we bridge academic theory and high-stress competition robotics through hands-on STEM outreach.`,
        robots: 'index, follow',
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `About ${brandSuffix}`,
          description: 'Autonomous robotics, embedded systems, and youth STEM education.',
          url: baseCanonical,
          mainEntity: {
            '@type': 'EducationalOrganization',
            name: brandSuffix,
            alternateName: "ALTRON'Z",
            foundingDate: '2022',
            description: 'Student-led autonomous robotics and IoT engineering society.',
            email: 'contact@altronz.org',
            telephone: '+1-555-726-2687',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Robotics Innovation Center, Block 4, Tech Innovation Campus, 400 Technology Way',
              addressLocality: 'Tech Innovation Campus',
              addressCountry: 'US',
            },
          },
        },
      };

    case 'sumo':
      return {
        title: `Robo Sumo Championship 2026 (3.0 kg Class) | ${brandSuffix}`,
        description: `Official rules, specs, and team registration for the ALTRON'Z Robo Sumo Championship. 3.0 kg combat wedges, neodymium magnetic downforce, and 154 cm Dohyo ring.`,
        robots: 'index, follow',
        ogType: 'article',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'SportsEvent',
          name: 'Robo Sumo Championship 2026',
          description: 'High-torque autonomous and RC heavyweight sumo wrestling bots clash on an official steel ring.',
          startDate: '2026-11-14T09:00:00',
          endDate: '2026-11-14T17:30:00',
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: "ALTRON'Z Arena - Tech Complex Hall A",
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Block 4, Tech Innovation Campus, 400 Technology Way',
            },
          },
          organizer: {
            '@type': 'Organization',
            name: brandSuffix,
            url: domain,
          },
          offers: {
            '@type': 'Offer',
            price: '25',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-01-01',
            url: baseCanonical,
          },
        },
      };

    case 'soccer':
      return {
        title: `Robo Soccer Invitational 2026 (2-vs-2 Omni) | ${brandSuffix}`,
        description: `High-frequency tactical robotic football tournament. 3-wheel holonomic drives, IR beacon ball tracking, solenoid kickers, and official mini-pitch rules.`,
        robots: 'index, follow',
        ogType: 'article',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'SportsEvent',
          name: 'Robo Soccer Invitational 2026',
          description: 'Agile omni-directional robots engage in high-octane 2-versus-2 tactical robotic football.',
          startDate: '2026-11-15T10:00:00',
          endDate: '2026-11-15T18:00:00',
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          location: {
            '@type': 'Place',
            name: 'Field Hall B - Mechatronics Center',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Block 4, Tech Innovation Campus, 400 Technology Way',
            },
          },
          organizer: {
            '@type': 'Organization',
            name: brandSuffix,
            url: domain,
          },
          offers: {
            '@type': 'Offer',
            price: '30',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            validFrom: '2026-01-01',
            url: baseCanonical,
          },
        },
      };

    case 'events':
      return {
        title: `Competitions, Tournaments & Rulebooks | ${brandSuffix}`,
        description: `Browse all robotics tournaments organized by ALTRON'Z ROBOTICS TEAM & IOT: Robo Sumo, Robo Soccer, Micro-Mouse Maze Runner, and Drone Obstacle Sprint.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'workshops':
      return {
        title: `Robotics, IoT & Embedded Systems Workshops | ${brandSuffix}`,
        description: `Kit-backed engineering workshops for schools and colleges. Learn autonomous mobile robotics, ESP32 IoT telemetry, FreeRTOS, and bare-metal ARM Cortex firmware.`,
        robots: 'index, follow',
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: 'Hands-On Robotics, IoT & Embedded Systems Workshops',
          description: 'Comprehensive hardware engineering bootcamps with individual hardware kits, breadboards, oscilloscopes, and verified certificates.',
          provider: {
            '@type': 'Organization',
            name: brandSuffix,
            url: domain,
          },
          hasCourseInstance: [
            {
              '@type': 'CourseInstance',
              name: 'School STEM: Autonomous Wheeled Mobile Robotics',
              courseMode: 'onsite',
              duration: '2 Days (12 Hours)',
            },
            {
              '@type': 'CourseInstance',
              name: 'College IoT: ESP32 Telemetry, MQTT & Cloud Pipelines',
              courseMode: 'onsite',
              duration: '3 Days (18 Hours)',
            },
            {
              '@type': 'CourseInstance',
              name: 'Bare-Metal ARM Firmware & Real-Time FreeRTOS',
              courseMode: 'onsite',
              duration: '2 Days (14 Hours)',
            },
          ],
        },
      };

    case 'projects':
      return {
        title: `Hardware R&D Projects & Robot Builds | ${brandSuffix}`,
        description: `Explore battle-tested robot builds and research prototypes by ALTRON'Z student engineers: combat sumos, holonomic soccer strikers, and LoRaWAN rovers.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'bot-details':
      return {
        title: `Bot Details & Engineering Blueprints | ${brandSuffix}`,
        description: `Official robot blueprints, CAD schematics, bill of materials, and PDF specifications published by the ALTRON'Z ROBOTICS TEAM & IOT engineering squad.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'achievements':
      return {
        title: `Championship Wins, Awards & Hall of Honors | ${brandSuffix}`,
        description: `Verified competition podium finishes, national tournament trophies, and engineering milestones earned by ALTRON'Z ROBOTICS TEAM & IOT squads.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'gallery':
      return {
        title: `Visual Media & Field Archives | ${brandSuffix}`,
        description: `High-resolution photographs from combat robotics arenas, student workshops, hardware soldering testbenches, and STEM clinics.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'team':
      return {
        title: `Meet Our Engineering Crew & Mentors | ${brandSuffix}`,
        description: `The multidisciplinary student engineering crew powering ALTRON'Z ROBOTICS TEAM & IOT across mechanical design, embedded firmware, AI vision, and outreach.`,
        robots: 'index, follow',
        ogType: 'website',
      };

    case 'contact':
      return {
        title: `Contact Laboratory & Host a Workshop | ${brandSuffix}`,
        description: `Inquire about hosting a hands-on robotics or IoT workshop at your school or university campus, or get in touch with ALTRON'Z engineering leads.`,
        robots: 'index, follow',
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `Contact ${brandSuffix}`,
          url: baseCanonical,
          mainEntity: {
            '@type': 'Organization',
            name: brandSuffix,
            email: 'contact@altronz.org',
            telephone: '+1-555-726-2687',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'ALTRON\'Z Robotics Center, Block 4, Tech Innovation Campus, 400 Technology Way',
            },
          },
        },
      };

    case 'login':
      return {
        title: `Staff Authentication Portal | ${brandSuffix}`,
        description: `Authorized operations access for verified team administrators and instructors.`,
        robots: 'noindex, nofollow', // Strictly protected from search engine indexing
        ogType: 'website',
      };

    case 'admin':
      return {
        title: `Operations Console | ${brandSuffix}`,
        description: `Protected administrative operations center.`,
        robots: 'noindex, nofollow', // Strictly protected from search engine indexing
        ogType: 'website',
      };

    case 'home':
    default:
      return {
        title: `ALTRON'Z ROBOTICS TEAM & IOT | Official Platform`,
        description: `ALTRON'Z ROBOTICS TEAM & IOT is a premier student engineering organization competing in autonomous combat robotics and conducting hands-on IoT, embedded systems, and STEM workshops for schools and colleges.`,
        robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ogType: 'website',
        schema: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'EducationalOrganization',
              '@id': `${domain}/#organization`,
              name: brandSuffix,
              alternateName: "ALTRON'Z",
              url: domain,
              logo: `${domain}/favicon.svg`,
              image: absoluteOgImage,
              description: 'Student-led robotics and embedded engineering team building competition combat bots and conducting youth STEM workshops.',
              email: 'contact@altronz.org',
              telephone: '+1-555-726-2687',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'ALTRON\'Z Robotics Center, Block 4, Tech Innovation Campus, 400 Technology Way',
                addressCountry: 'US',
              },
              sameAs: [
                'https://github.com/altronz',
              ],
            },
            {
              '@type': 'WebSite',
              '@id': `${domain}/#website`,
              url: domain,
              name: brandSuffix,
              publisher: {
                '@id': `${domain}/#organization`,
              },
            },
          ],
        },
      };
  }
};

export const SEOManager: React.FC<SEOManagerProps> = ({ currentView }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const domain = getProductionDomain();
    const meta = getPageMetadata(currentView, domain);
    const canonicalUrl = `${domain}/${currentView === 'home' ? '' : '#' + currentView}`;
    const ogImageUrl = `${domain}/og-image.png`;

    // 1. Update Document Title
    document.title = meta.title;

    // Helper to update or create <meta> tag
    const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
      let tag = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Primary SEO Meta Tags
    setMetaTag('name', 'description', meta.description);
    setMetaTag('name', 'robots', meta.robots);

    // 3. OpenGraph Tags
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('property', 'og:type', meta.ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', "ALTRON'Z ROBOTICS TEAM & IOT");
    setMetaTag('property', 'og:image', ogImageUrl);
    setMetaTag('property', 'og:image:secure_url', ogImageUrl);
    setMetaTag('property', 'og:image:type', 'image/png');
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', "ALTRON'Z ROBOTICS TEAM & IOT - Official Engineering Platform");

    // 4. Twitter / X Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.description);
    setMetaTag('name', 'twitter:image', ogImageUrl);
    setMetaTag('name', 'twitter:image:alt', "ALTRON'Z ROBOTICS TEAM & IOT");

    // 5. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. JSON-LD Dynamic Schema
    let schemaScript = document.getElementById('altronz-dynamic-jsonld');
    if (meta.schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'altronz-dynamic-jsonld';
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(meta.schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [currentView]);

  return null;
};
