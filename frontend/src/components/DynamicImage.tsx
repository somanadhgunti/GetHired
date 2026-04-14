import { motion } from 'framer-motion'

interface DynamicImageProps {
  src: string
  alt: string
  className?: string
  animationType?: 'float' | 'rotate' | 'scale' | 'glow' | 'parallax'
  delay?: number
}

export default function DynamicImage({
  src,
  alt,
  className = '',
  animationType = 'float',
  delay = 0,
}: DynamicImageProps) {
  const animationVariants = {
    float: {
      y: [0, -20, 0],
      rotateZ: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    rotate: {
      rotateY: [0, 360],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    scale: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    glow: {
      boxShadow: [
        '0 0 20px rgba(110, 231, 255, 0.3)',
        '0 0 40px rgba(110, 231, 255, 0.6)',
        '0 0 20px rgba(110, 231, 255, 0.3)',
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    parallax: {
      y: [0, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        ...animationVariants[animationType],
      }}
      transition={{
        opacity: { duration: 0.8, delay },
      }}
    />
  )
}
