import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/libros", destination: "/", permanent: true },
      { source: "/libros/foro", destination: "/foro", permanent: true },
      { source: "/libros/foro/:id", destination: "/foro/:id", permanent: true },
      { source: "/libros/autor/:slug", destination: "/autor/:slug", permanent: true },
      { source: "/libros/colecciones", destination: "/colecciones", permanent: true },
      { source: "/libros/genero/:genre", destination: "/genero/:genre", permanent: true },
      { source: "/libros/mi-perfil-autor", destination: "/mi-perfil-autor", permanent: true },
      { source: "/libros/publicar", destination: "/publicar", permanent: true },
      { source: "/libros/:slug/leer", destination: "/:slug/leer", permanent: true },
      { source: "/libros/:slug", destination: "/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
