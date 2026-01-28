# Shopping Cart Lottie Animation Guide

This documentation provides a comprehensive guide to replicating the "Logo to Cart" flying Lottie animation seen in the AppZeto project. This effect uses `framer-motion` for movement, `@lottiefiles/dotlottie-react` for the animation, and React Portals for seamless rendering.

## 1. Prerequisites

Install the necessary dependencies in your target project:

```bash
npm install framer-motion @lottiefiles/dotlottie-react react-dom
```

## 2. Core Logic Analysis

The animation works by calculating the real-time screen coordinates of two elements: the **Logo** (start) and the **Cart Icon** (end). It then renders a "flying" container that moves between these two points.

**Key Components:**

- **`useRef`**: Used to identify the start (Logo) and end (Cart) elements.
- **`getBoundingClientRect()`**: Used to get the exact X and Y coordinates on the screen.
- **`framer-motion`**: Handles the translation (movement) and scaling of the animation.
- **`createPortal`**: Renders the animation at the end of `document.body` to avoid clipping by headers or parent containers with `overflow: hidden`.

## 3. Implementation Steps

### Step A: Set up Refs and State

In your `Header.jsx` component, initialize the refs and state variables to manage positions and visibility.

```jsx
const logoRef = useRef(null);
const cartRef = useRef(null);
const [showCartAnimation, setShowCartAnimation] = useState(false);
const [positions, setPositions] = useState({
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
});
const [hasPlayed, setHasPlayed] = useState(false);
```

### Step B: Calculate Screen Positions

Use a `useEffect` to calculate coordinates once the component mounts.

```jsx
useEffect(() => {
  const calculatePositions = () => {
    if (logoRef.current && cartRef.current) {
      const logoRect = logoRef.current.getBoundingClientRect();
      const cartRect = cartRef.current.getBoundingClientRect();

      setPositions({
        startX: logoRect.left + logoRect.width / 2,
        startY: logoRect.top + logoRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      });

      if (!hasPlayed) {
        setShowCartAnimation(true);
        setHasPlayed(true);
      }
    }
  };

  // Delay slightly to ensure DOM is fully painted
  setTimeout(calculatePositions, 500);
  window.addEventListener("resize", calculatePositions);
  return () => window.removeEventListener("resize", calculatePositions);
}, [hasPlayed]);
```

### Step C: Create the Animation Component

Define the animated element using `framer-motion` and the Lottie asset.

```jsx
const AnimationContent = () => (
  <motion.div
    className="fixed pointer-events-none"
    style={{ left: 0, top: 0, zIndex: 10001 }}
    initial={{ x: positions.startX - 40, y: positions.startY - 40, opacity: 1 }}
    animate={{
      x: positions.endX - 40,
      y: positions.endY - 40,
      scale: [1, 1.2, 0.8],
      opacity: [1, 1, 0],
    }}
    transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
    onAnimationComplete={() => setShowCartAnimation(false)}>
    <div className="w-20 h-20">
      <DotLottieReact
        src="https://lottie.host/083a2680-e854-4006-a50b-674276be82cd/oQMRcuZUkS.lottie"
        autoplay
        loop={false}
      />
    </div>
  </motion.div>
);
```

## 4. Full Component Structure

Integrate the logic into your `Header.jsx`:

```jsx
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Header = () => {
  // ... state and useEffect logic from above ...

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* 1. Portal for Animation */}
      {showCartAnimation && createPortal(<AnimationContent />, document.body)}

      <div className="container mx-auto flex justify-between items-center p-4">
        {/* 2. Logo with Ref */}
        <div ref={logoRef} className="logo-container">
          <img src="/logo.png" alt="Logo" />
        </div>

        {/* 3. Cart with Ref */}
        <button ref={cartRef} className="cart-button">
          <FiShoppingBag />
        </button>
      </div>
    </header>
  );
};
```

## 5. Key Implementation Details

- **Asset**: The Lottie animation used is hosted at: `https://lottie.host/083a2680-e854-4006-a50b-674276be82cd/oQMRcuZUkS.lottie`.
- **Z-Index**: Ensure the animation's `zIndex` (e.g., `10001`) is higher than your header and any overlays.
- **Centering**: The `-40` offset in `initial` and `animate` (x/y) is half the width/height of the animation container (`w-20` = 80px), ensuring the animation centers perfectly on the refs.
- **Portals**: Always use `createPortal` to render the animation. This prevents it from being "cut off" if the header has `overflow: hidden` or specific stacking contexts.

## 6. Variations

- **Mobile Adaptation**: In `MobileHeader.jsx`, the animation duration is slightly longer (`4s`) and the scale is smaller (`w-12`) to fit mobile screens better.
- **Dynamic Triggers**: To trigger this every time an item is added, call `setShowCartAnimation(true)` and `setHasPlayed(false)` inside your `addItemToCart` function instead of only on mount.
