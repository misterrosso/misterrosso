'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Category {
  id: number;
  name: string;
  subtitle: string | null;
  order: number;
  hidden: boolean;
}

interface Item {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_specialty: boolean;
  hidden: boolean;
  order: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  button_text: string | null;
  button_url: string | null;
  status: string;
  poster_image_url: string | null;
  order: number;
}

interface GalleryImage {
  src: string;
  alt: string;
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [menuSubtitle, setMenuSubtitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPoster, setExpandedPoster] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('hidden', false)
          .order('order', { ascending: true });

        // Fetch items
        const { data: itemData } = await supabase
          .from('items')
          .select('*')
          .eq('hidden', false)
          .order('category_id', { ascending: true })
          .order('order', { ascending: true });

        // Fetch events (published only)
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: true });

        setCategories(catData || []);
        setItems(itemData || []);
        setEvents(eventData || []);

        // Fetch menu subtitle from Supabase settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('menu_subtitle')
          .eq('id', 1)
          .single();
        
        setMenuSubtitle(settingsData?.menu_subtitle || '');

        // Fetch gallery images
        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        setGalleryImages(galleryData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ESC key listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedPoster) {
        setExpandedPoster(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedPoster]);

  // Gallery keyboard and swipe handlers
  useEffect(() => {
    const handleGalleryKeyDown = (e: KeyboardEvent) => {
      if (expandedGalleryIndex === null) return;

      if (e.key === 'Escape') {
        setExpandedGalleryIndex(null);
      } else if (e.key === 'ArrowRight') {
        setExpandedGalleryIndex((prev) => (prev !== null ? (prev + 1) % galleryImages.length : 0));
      } else if (e.key === 'ArrowLeft') {
        setExpandedGalleryIndex((prev) => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0));
      }
    };

    window.addEventListener('keydown', handleGalleryKeyDown);
    return () => window.removeEventListener('keydown', handleGalleryKeyDown);
  }, [expandedGalleryIndex, galleryImages.length]);

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleGalleryTouchEnd = (e: React.TouchEvent) => {
    if (expandedGalleryIndex === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Swiped left, go to next image
      setExpandedGalleryIndex((prev) => (prev + 1) % galleryImages.length);
    } else if (diff < -50) {
      // Swiped right, go to previous image
      setExpandedGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#964146' }}>
        <p>Cargando menú...</p>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = categories.reduce((acc, cat) => {
    acc[cat.id] = items.filter((item) => item.category_id === cat.id);
    return acc;
  }, {} as Record<number, Item[]>);

  return (
    <div style={{ fontFamily: 'var(--font-dm-sans)', backgroundColor: '#faf8f3' }}>
      <style>{`
        .event-description a {
          color: #000;
          text-decoration: underline;
          transition: color 0.3s;
        }
        .event-description a:hover {
          color: #f0bd50;
        }
        .event-image-container {
          display: block;
          margin-bottom: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.3s;
        }
        .event-image-container:hover {
          opacity: 0.9;
        }
        .event-image-container img {
          transition: opacity 0.3s, transform 0.3s;
          border-radius: 8px;
        }
        @media (max-width: 768px) {
          .horarios-item span {
            display: block;
          }
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .menu-pig-container img {
            max-width: 200px;
          }
        }
        @media (max-width: 768px) {
          .main-logo-container {
            margin-bottom: 0.75rem !important;
          }
          .main-logo-container img {
            max-width: 250px !important;
          }
          .header {
            padding: 1.5rem 1rem !important;
          }
          .header .social-links {
            margin-bottom: 0.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .info-section {
            padding: 1.5rem 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .info-content {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .menu-pig-container img {
            max-width: 200px !important;
          }
        }
        .close-button:hover {
          background-color: rgba(0, 0, 0, 0.8);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .gallery-item {
          animation: slideUp 0.6s ease-out forwards;
        }
        .gallery-item:nth-child(1) { animation-delay: 0.05s; }
        .gallery-item:nth-child(2) { animation-delay: 0.1s; }
        .gallery-item:nth-child(3) { animation-delay: 0.15s; }
        .gallery-item:nth-child(4) { animation-delay: 0.2s; }
        .gallery-item:nth-child(5) { animation-delay: 0.25s; }
        .gallery-item:nth-child(6) { animation-delay: 0.3s; }
        .gallery-item:nth-child(n+7) { animation-delay: 0.35s; }
        .gallery-item:hover {
          transform: scale(1.05);
          transition: transform 0.3s ease;
        }
        .gallery-close-button:hover {
          background-color: rgba(0, 0, 0, 0.9);
        }
        .gallery-prev-button:hover,
        .gallery-next-button:hover {
          background-color: rgba(255, 255, 255, 0.4);
        }
        @media (max-width: 768px) {
          .gallery-prev-button,
          .gallery-next-button {
            font-size: 2rem;
            padding: 0.3rem 0.6rem;
          }
        }
      `}</style>
      {/* HEADER */}
      <header style={styles.header} className="header">
        <div style={styles.headerContent}>
          {/* Mister Rosso Logo */}
          <div style={styles.logoContainer} className="main-logo-container">
            <Image
              src="/images/main_logo.png"
              alt="Mister Rosso"
              width={400}
              height={150}
              priority
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Social Links - Using PNG icons */}
          <div style={styles.socialLinks} className="social-links">
            <a
              href="https://www.instagram.com/mister_rosso/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialLink}
              title="Instagram"
            >
              <Image
                src="/images/ig-icon.png"
                alt="Instagram"
                width={32}
                height={32}
              />
            </a>
            <a
              href="https://www.ubereats.com/store/mister-rosso-kitchenette/u8sh73tKXB-IZXA1M8dTUA"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialLink}
              title="Uber Eats"
            >
              <Image
                src="/images/uber-eats-icon.png"
                alt="Uber Eats"
                width={32}
                height={32}
              />
            </a>
          </div>
        </div>
      </header>

      {/* HORARIOS & UBICACION */}
      <section style={styles.infoSection} className="info-section">
        <div style={styles.infoContent} className="info-content">
          <div style={styles.infoBlock}>
            <h2 style={styles.infoTitle}>HORARIOS</h2>
            <p style={styles.infoText} className="horarios-item">
              <span style={{ fontWeight: 700 }}>Lunes y Martes:</span> 3pm - 7:30pm
            </p>
            <p style={styles.infoText} className="horarios-item">
              <span style={{ fontWeight: 700 }}>Miércoles a Sábado:</span> 1pm - 6:30pm
            </p>
            <p style={styles.infoText} className="horarios-item">
              <span style={{ fontWeight: 700 }}>Domingos:</span> CERRADO
            </p>
          </div>

          <div style={styles.infoBlock}>
            <h2 style={styles.infoTitle}>UBICACIÓN</h2>
            <p style={styles.infoText}>QRO</p>
            <div style={{ marginTop: '1rem' }}>
              <a
                href="https://maps.app.goo.gl/jVXptiaN1RFPnmg26"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.mapsLink}
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MENU SECTION - Full Teal Background */}
      <section style={styles.menuSection}>
        {/* Menu Header with title and pig icon */}
        <div style={styles.menuHeader}>
          <h1 style={styles.menuTitle}>MENÚ</h1>
          <div style={styles.menuPigContainer} className="menu-pig-container">
            <Image
              src="/images/pig_icon.png"
              alt="Pig"
              width={300}
              height={180}
              style={{ maxWidth: '100%', height: 'auto', aspectRatio: '804/488' }}
            />
          </div>

          {/* Menu Subtitle */}
          {menuSubtitle && (
            <p style={styles.menuSubtitle}>{menuSubtitle}</p>
          )}
        </div>

        {/* Categories and Items */}
        <div style={styles.menuContent}>
          {categories.map((category) => {
            const categoryItems = itemsByCategory[category.id] || [];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} style={styles.categoryBlock}>
                <h2 style={styles.categoryName}>{category.name}</h2>
                {category.subtitle && (
                  <p style={styles.categorySubtitle}>{category.subtitle}</p>
                )}

                <div style={styles.itemsList}>
                  {categoryItems.map((item) => (
                    <div key={item.id} style={styles.itemCard}>
                      <div style={styles.itemHeader}>
                        <h3 style={styles.itemName}>{item.name}</h3>
                        <span style={styles.itemPrice}>${item.price}</span>
                      </div>

                      {item.description && (
                        <p style={styles.itemDescription}>{item.description}</p>
                      )}

                      <div style={styles.itemBadges}>
                        {item.is_vegetarian && <span style={styles.badge}>🌿</span>}
                        {item.is_spicy && <span style={styles.badge}>🌶</span>}
                        {item.is_specialty && <span style={styles.badge}>★</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Decorative image at bottom of menu */}
        <div style={styles.menuDecoration}>
          <Image
            src="/images/bao.png"
            alt="Bao"
            width={150}
            height={150}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </section>

      {/* EVENTS SECTION */}
      {events.length > 0 && (
        <section style={styles.eventsSection}>
          {/* Vertical logo at top */}
          <div style={styles.eventsDecoration}>
            <Image
              src="/images/vertical_logo.png"
              alt="Mister Rosso"
              width={120}
              height={120}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          <h2 style={styles.eventsTitle}>EVENTOS</h2>

          <div style={styles.eventsList}>
            {events.map((event) => (
              <div key={event.id} style={styles.eventCard}>
                {event.poster_image_url && (
                  <div
                    className="event-image-container"
                    style={{
                      ...styles.eventImageContainer,
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '135%', // 200x270 aspect ratio
                      overflow: 'hidden',
                    }}
                    onClick={() => setExpandedPoster(event.poster_image_url)}
                  >
                    <Image
                      src={event.poster_image_url}
                      alt={event.title}
                      fill
                      style={{ objectFit: 'cover', cursor: 'pointer' }}
                    />
                  </div>
                )}

                <h3 style={styles.eventTitle}>{event.title}</h3>

                {event.date && (
                  <p style={styles.eventDate} suppressHydrationWarning>
                    {(() => {
                      const [year, month, day] = event.date.split('-');
                      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return localDate.toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    })()}
                  </p>
                )}

                {event.description && (
                  <div
                    className="event-description"
                    style={styles.eventDescription}
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}

                {event.button_text && event.button_url && (
                  <a
                    href={event.button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.ctaButton}
                  >
                    {event.button_text}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GALERÍA SECTION */}
      <section style={styles.gallerySection}>
        <div style={styles.galleryDecoration}>
          <Image
            src="/images/rosso_wu.png"
            alt="Mister Rosso"
            width={612}
            height={549}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <h2 style={styles.galleryTitle}>GALERÍA</h2>

        {galleryImages.length > 0 && (
          <div style={styles.galleryGrid} className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                style={styles.galleryItem}
                className="gallery-item"
                onClick={() => setExpandedGalleryIndex(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}

        <div style={styles.instagramButtonContainer}>
          <a
            href="https://www.instagram.com/mister_rosso/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.instagramButton}
          >
            Síguenos en Instagram
          </a>
        </div>
      </section>

      {/* GALLERY MODAL */}
      {expandedGalleryIndex !== null && (
        <div
          style={styles.galleryModalOverlay}
          onClick={() => setExpandedGalleryIndex(null)}
          onTouchStart={handleGalleryTouchStart}
          onTouchEnd={handleGalleryTouchEnd}
        >
          <div style={styles.galleryModalContent}>
            <button
              className="gallery-close-button"
              style={styles.galleryCloseButton}
              onClick={() => setExpandedGalleryIndex(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <button
              className="gallery-prev-button"
              style={styles.galleryPrevButton}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedGalleryIndex((prev) => (prev! - 1 + galleryImages.length) % galleryImages.length);
              }}
              aria-label="Previous"
            >
              ‹
            </button>

            <div style={styles.galleryImageContainer}>
              <Image
                src={galleryImages[expandedGalleryIndex].src}
                alt={galleryImages[expandedGalleryIndex].alt}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>

            <button
              className="gallery-next-button"
              style={styles.galleryNextButton}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedGalleryIndex((prev) => (prev! + 1) % galleryImages.length);
              }}
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerPigContainer}>
          <Image
            src="/images/black_pig_icon.png"
            alt="Pig"
            width={120}
            height={90}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <p style={styles.footerText}>Mister Rosso Kitchenette</p>
        <p style={styles.footerSubtext}>Querétaro, México</p>
      </footer>

      {/* POSTER MODAL */}
      {expandedPoster && (
        <div
          style={styles.modalOverlay}
          onClick={() => setExpandedPoster(null)}
        >
          <div style={styles.modalContent}>
            <button
              className="close-button"
              style={styles.closeButton}
              onClick={() => setExpandedPoster(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <Image
              src={expandedPoster}
              alt="Event poster"
              width={600}
              height={800}
              style={{ maxWidth: '90vw', maxHeight: '90vh', height: 'auto', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#964146',
    color: '#faf8f3',
    padding: '2rem 1rem',
    textAlign: 'center' as const,
  },
  headerContent: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  logoContainer: {
    marginBottom: '1.5rem',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
  },
  socialLink: {
    color: '#f0bd50',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, opacity 0.2s',
  },

  // HORARIOS & UBICACION
  infoSection: {
    backgroundColor: '#964146',
    padding: '2rem 1rem',
  },
  infoContent: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    justifyItems: 'center',
  },
  infoBlock: {
    textAlign: 'center' as const,
    width: '100%',
  },
  infoDivider: {
    display: 'none',
  },
  mapsButtonContainer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
  },
  mapsLink: {
    display: 'inline-block',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#f0bd50',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all 0.3s',
  },
  infoTitle: {
    fontSize: '1.4rem',
    fontFamily: '"Space Mono", monospace',
    color: '#faf8f3',
    fontWeight: 700,
    marginBottom: '1rem',
    letterSpacing: '0.05em',
  },
  infoText: {
    fontSize: '0.95rem',
    color: '#faf8f3',
    margin: '0.5rem 0',
    lineHeight: 1.5,
  },

  // MENU SECTION
  menuSection: {
    backgroundColor: '#3d6871',
    paddingBottom: '2rem',
  },
  menuHeader: {
    color: '#faf8f3',
    padding: '2rem 1rem',
    textAlign: 'center' as const,
  },
  menuTitle: {
    fontSize: '2.5rem',
    fontFamily: '"Space Mono", monospace',
    margin: '0 0 1rem 0',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#faf8f3',
  },
  menuPigContainer: {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
  },
  menuSubtitle: {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    margin: '1rem 0 0 0',
    color: '#faf8f3',
    opacity: 0.95,
  },
  menuContent: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  categoryBlock: {
    marginBottom: '3rem',
  },
  categoryName: {
    fontSize: '1.8rem',
    fontFamily: '"Space Mono", monospace',
    color: '#f0bd50',
    fontWeight: 700,
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  categorySubtitle: {
    fontSize: '0.95rem',
    color: '#faf8f3',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  itemsList: {
    display: 'grid',
    gap: '1rem',
  },
  itemCard: {
    backgroundColor: '#faf8f3',
    padding: '1.25rem',
    borderRadius: '6px',
    borderLeft: '4px solid #f0bd50',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '1rem',
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
    flex: 1,
  },
  itemPrice: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#964146',
    whiteSpace: 'nowrap' as const,
  },
  itemDescription: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0.75rem 0',
    lineHeight: 1.4,
  },
  itemBadges: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  badge: {
    fontSize: '1.1rem',
    display: 'inline-block',
  },
  menuDecoration: {
    textAlign: 'center' as const,
    padding: '2rem 1rem',
  },

  // EVENTS SECTION
  eventsSection: {
    backgroundColor: '#964146',
    color: '#faf8f3',
    padding: '2rem 1rem',
  },
  eventsDecoration: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  eventsTitle: {
    fontSize: '2.5rem',
    fontFamily: '"Space Mono", monospace',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  eventsList: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  eventImageContainer: {
    marginBottom: '1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
  },
  eventTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginTop: 0,
    marginBottom: '0.5rem',
  },
  eventDate: {
    fontSize: '0.9rem',
    color: '#f0bd50',
    marginBottom: '1rem',
    fontWeight: 500,
  },
  eventDescription: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    color: '#faf8f3',
  },
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#f0bd50',
    color: '#000',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
  },

  // FOOTER
  footer: {
    backgroundColor: '#000',
    color: '#faf8f3',
    padding: '2rem 1rem',
    textAlign: 'center' as const,
  },
  footerPigContainer: {
    marginBottom: '1rem',
  },
  footerText: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
  },
  footerSubtext: {
    fontSize: '0.9rem',
    color: '#999',
    margin: 0,
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    position: 'relative' as const,
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  closeButton: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    color: '#fff',
    fontSize: '1.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0.65rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    zIndex: 10000,
  },

  // GALLERY SECTION
  gallerySection: {
    backgroundColor: '#000000',
    color: '#faf8f3',
    padding: '3rem 1rem',
  },
  galleryDecoration: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
    maxWidth: '200px',
    margin: '0 auto 1.5rem',
  },
  galleryTitle: {
    fontSize: '2.5rem',
    fontFamily: '"Space Mono", monospace',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#faf8f3',
  },
  galleryGrid: {
    maxWidth: '1200px',
    margin: '0 auto 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
  } as const,
  galleryItem: {
    position: 'relative' as const,
    width: '100%',
    paddingBottom: '100%',
    cursor: 'pointer',
    overflow: 'hidden',
    borderRadius: '4px',
    animation: 'slideUp 0.6s ease-out forwards',
  } as any,
  instagramButtonContainer: {
    textAlign: 'center' as const,
    marginTop: '2rem',
  },
  instagramButton: {
    display: 'inline-block',
    padding: '0.85rem 2rem',
    backgroundColor: '#f0bd50',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
  },
  galleryModalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  galleryModalContent: {
    position: 'relative' as const,
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryCloseButton: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    zIndex: 10000,
  },
  galleryPrevButton: {
    position: 'absolute' as const,
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '3rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    zIndex: 10000,
    lineHeight: 1,
  },
  galleryNextButton: {
    position: 'absolute' as const,
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '3rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
    zIndex: 10000,
    lineHeight: 1,
  },
};
