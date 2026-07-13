"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsArrowRight, BsPlayFill, BsStars } from "react-icons/bs";
import * as THREE from "three";
import { bannerImages } from "./content/bannerImages";

const heroSlides = [
  {
    title: "Multi-boutiques",
    text: "Plusieurs vendeurs, un seul panier.",
    image: "/images/models/woman-fashion.jpg",
  },
  {
    title: "Vendeurs choisis",
    text: "Des boutiques claires et faciles a comparer.",
    image: "/images/models/man-watch.jpg",
  },
  {
    title: "Achat rapide",
    text: "Catalogue, boutique ou assistant.",
    image: "/images/models/woman-lunettes.jpg",
  },
];

const HeroBanner = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const canvasRef = useRef(null);
  const featuredImages = useMemo(() => bannerImages.slice(0, 5), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    scene.add(group);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0xf7efe2,
        metalness: 0.55,
        roughness: 0.35,
        wireframe: true,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        metalness: 0.2,
        roughness: 0.45,
        transparent: true,
        opacity: 0.4,
        wireframe: true,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.32,
        roughness: 0.38,
        wireframe: true,
      }),
    ];

    const shapes = [
      new THREE.Mesh(new THREE.TorusKnotGeometry(1.15, 0.22, 130, 12), materials[0]),
      new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.7, 1.7, 5, 5, 5), materials[1]),
      new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 12, 92), materials[2]),
    ];

    shapes[0].position.set(2.45, 0.45, -1.4);
    shapes[1].position.set(-3.1, -0.9, -2.2);
    shapes[2].position.set(0.3, 1.95, -2.8);
    shapes[2].rotation.x = Math.PI / 2.8;

    shapes.forEach((shape) => group.add(shape));

    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = Math.sin(elapsed * 0.35) * 0.22;
      group.rotation.x = Math.cos(elapsed * 0.28) * 0.08;
      shapes[0].rotation.x = elapsed * 0.34;
      shapes[0].rotation.y = elapsed * 0.42;
      shapes[1].rotation.x = elapsed * -0.22;
      shapes[1].rotation.z = elapsed * 0.3;
      shapes[2].rotation.z = elapsed * 0.5;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      shapes.forEach((shape) => {
        shape.geometry.dispose();
      });
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section
      className="relative isolate overflow-hidden bg-[#101113] text-white"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 opacity-30">
        <Image
          src={currentSlide.image}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#101113_0%,rgba(16,17,19,0.88)_42%,rgba(16,17,19,0.5)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(16,17,19,0),#101113)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[680px] max-w-screen-2xl gap-8 px-4 py-8 sm:px-6 lg:min-h-[720px] lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:px-10">
        <div className="z-10 max-w-2xl py-10">
          <p className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <BsStars className="h-4 w-4" />
            Marketplace multi-boutiques
          </p>

          <h1
            id="hero-heading"
            className="mt-6 text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl lg:text-8xl"
          >
            Mode
            <br />
            multi-
            <br />
            boutiques.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/72 sm:text-base">
            Achetez chez plusieurs boutiques tunisiennes depuis un seul site:
            produits, vendeurs et commandes au même endroit.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/boutiques"
              className="inline-flex items-center justify-center gap-2 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-[#f4efe6]"
            >
              Voir les boutiques <BsArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center border border-white/35 px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white/10"
            >
              Voir le catalogue
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 text-xs uppercase tracking-[0.12em]">
            {["Boutiques", "Produits", "Commande"].map(
              (item) => (
                <div key={item} className="border border-white/12 bg-white/8 p-3 backdrop-blur">
                  <p className="text-white/55">SB</p>
                  <p className="mt-1 font-bold text-white">{item}</p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="relative min-h-[520px] lg:min-h-[640px]" aria-hidden="true">
          <div className="hero-perspective absolute inset-0">
            <div className="hero-stage">
              <div className="hero-device">
                <div className="hero-device-top">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="hero-video">
                  <Image
                    src={currentSlide.image}
                    alt=""
                    fill
                    priority
                    unoptimized
                    sizes="(min-width: 1024px) 620px, 90vw"
                    className="object-cover"
                  />
                  <div className="hero-video-overlay" />
                  <div className="hero-video-label">
                    <span className="flex h-9 w-9 items-center justify-center bg-white text-black">
                      <BsPlayFill className="h-5 w-5" />
                    </span>
                    <div>
                      <p>{currentSlide.title}</p>
                      <span>{currentSlide.text}</span>
                    </div>
                  </div>
                </div>
              </div>

              {featuredImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`hero-float-card hero-float-card-${index + 1}`}
                >
                  <Image
                    src={image.src}
                    alt=""
                    width={220}
                    height={260}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 z-20 mx-auto flex max-w-xl gap-2 px-3">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 flex-1 transition ${
                  activeSlide === index ? "bg-white" : "bg-white/25"
                }`}
                aria-label={`Afficher le slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-perspective {
          perspective: 1200px;
        }

        .hero-stage {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: stageDrift 9s ease-in-out infinite alternate;
        }

        .hero-device {
          position: absolute;
          left: 18%;
          top: 7%;
          width: min(58vw, 560px);
          height: min(68vh, 620px);
          min-height: 440px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 40px 90px rgba(0, 0, 0, 0.42);
          transform: rotateY(-18deg) rotateX(7deg) translateZ(80px);
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .hero-device-top {
          display: flex;
          gap: 8px;
          height: 42px;
          align-items: center;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.26);
        }

        .hero-device-top span {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.55);
        }

        .hero-video {
          position: relative;
          height: calc(100% - 42px);
          overflow: hidden;
        }

        .hero-video :global(img) {
          animation: imagePulse 8s ease-in-out infinite alternate;
        }

        .hero-video-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.78)),
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.08) 0,
              rgba(255, 255, 255, 0.08) 1px,
              transparent 1px,
              transparent 9px
            );
        }

        .hero-video-label {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 22px;
          display: flex;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.42);
          padding: 16px;
          backdrop-filter: blur(12px);
        }

        .hero-video-label p {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .hero-video-label span {
          display: block;
          margin-top: 4px;
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.68);
        }

        .hero-float-card {
          position: absolute;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.34);
          background: #181818;
          animation: cardFloat 6s ease-in-out infinite alternate;
        }

        .hero-float-card-1 {
          right: 3%;
          top: 9%;
          width: 150px;
          height: 190px;
          transform: translateZ(180px) rotateY(-28deg) rotateZ(5deg);
        }

        .hero-float-card-2 {
          left: 2%;
          top: 45%;
          width: 140px;
          height: 170px;
          transform: translateZ(150px) rotateY(20deg) rotateZ(-6deg);
          animation-delay: -1s;
        }

        .hero-float-card-3 {
          right: 8%;
          bottom: 14%;
          width: 170px;
          height: 130px;
          transform: translateZ(220px) rotateY(-18deg) rotateZ(-3deg);
          animation-delay: -2s;
        }

        .hero-float-card-4,
        .hero-float-card-5 {
          display: none;
        }

        @keyframes stageDrift {
          from {
            transform: rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0);
          }
          to {
            transform: rotateY(4deg) rotateX(-2deg) translate3d(-10px, 8px, 0);
          }
        }

        @keyframes cardFloat {
          from {
            margin-top: 0;
          }
          to {
            margin-top: -18px;
          }
        }

        @keyframes imagePulse {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.08);
          }
        }

        @media (max-width: 1023px) {
          .hero-device {
            left: 10%;
            top: 5%;
            width: 78vw;
            height: 460px;
            min-height: 420px;
          }

        }

        @media (max-width: 640px) {
          .hero-device {
            left: 2%;
            width: 94vw;
            height: 390px;
            min-height: 360px;
            transform: rotateY(-10deg) rotateX(5deg) translateZ(40px);
          }

          .hero-float-card {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
