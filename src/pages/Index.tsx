import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProductCarousel from "@/components/landing/ProductCarousel";
import CategoryGrid from "@/components/landing/CategoryGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useMemo } from "react";

const Index = () => {
  const isMobile = useIsMobile();
  const { data: sellerProducts, isLoading } = useSellerProducts(50);

  // Transform seller_catalog products to the format expected by ProductCarousel
  const products = useMemo(() => {
    if (!sellerProducts) return [];
    
    return sellerProducts.map(product => {
      const images = product.images as any;
      const mainImage = Array.isArray(images) && images.length > 0 
        ? images[0] 
        : typeof images === 'string' ? images : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=400&fit=crop';

      return {
        id: product.id,
        name: product.nombre,
        price: product.precio_venta,
        image: mainImage,
        sku: product.sku,
        storeId: product.store?.id,
        storeName: product.store?.name,
        storeWhatsapp: product.store?.whatsapp || undefined,
      };
    });
  }, [sellerProducts]);

  // Split products for different sections
  const featuredProducts = products.slice(0, 10);
  const newProducts = products.slice(0, 10);
  const topProducts = products.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop header - hidden on mobile since GlobalMobileHeader handles it */}
      {!isMobile && <Header />}
      
      <main className={isMobile ? "pb-14" : ""}>
        <HeroSection />
        {/* Categories grid from database */}
        <CategoryGrid />

        {/* Productos Destacados */}
        <ProductCarousel
          title="🔥 PRODUCTOS DESTACADOS"
          products={featuredProducts}
          itemsPerView={5}
          isLoading={isLoading}
        />

        {/* Lo Más Nuevo */}
        <ProductCarousel
          title="⭐ LO MÁS NUEVO"
          products={newProducts}
          itemsPerView={5}
          isLoading={isLoading}
        />

        {/* Top Ventas */}
        <ProductCarousel
          title="👑 TOP VENTAS"
          products={topProducts}
          itemsPerView={5}
          isLoading={isLoading}
        />
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default Index;