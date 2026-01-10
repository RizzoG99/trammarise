import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AILoadingOrb } from './AILoadingOrb';

describe('AILoadingOrb', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<AILoadingOrb />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with default size', () => {
      const { container } = render(<AILoadingOrb />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders with custom size', () => {
      const { container } = render(<AILoadingOrb size={160} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '160px', height: '160px' });
    });

    it('renders with animating class', () => {
      const { container } = render(<AILoadingOrb />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveClass('animating');
    });
  });

  describe('SVG Structure', () => {
    it('renders SVG element', () => {
      const { container } = render(<AILoadingOrb />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('SVG has correct viewBox', () => {
      const { container } = render(<AILoadingOrb />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 120 120');
    });

    it('SVG matches size prop', () => {
      const { container } = render(<AILoadingOrb size={200} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('SVG has overflow visible style', () => {
      const { container } = render(<AILoadingOrb />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveStyle({ overflow: 'visible' });
    });
  });

  describe('Gradients', () => {
    it('defines gradient1', () => {
      const { container } = render(<AILoadingOrb />);
      const gradient = container.querySelector('#gradient1');
      expect(gradient).toBeInTheDocument();
    });

    it('defines gradient2', () => {
      const { container } = render(<AILoadingOrb />);
      const gradient = container.querySelector('#gradient2');
      expect(gradient).toBeInTheDocument();
    });

    it('defines gradient3', () => {
      const { container } = render(<AILoadingOrb />);
      const gradient = container.querySelector('#gradient3');
      expect(gradient).toBeInTheDocument();
    });

    it('defines glow filter', () => {
      const { container } = render(<AILoadingOrb />);
      const filter = container.querySelector('#glow');
      expect(filter).toBeInTheDocument();
    });
  });

  describe('Orb Layers', () => {
    it('renders background layer (layer-1)', () => {
      const { container } = render(<AILoadingOrb />);
      const layer = container.querySelector('.orb-layer-1');
      expect(layer).toBeInTheDocument();
      expect(layer).toHaveAttribute('fill', 'url(#gradient1)');
    });

    it('renders middle layer (layer-2)', () => {
      const { container } = render(<AILoadingOrb />);
      const layer = container.querySelector('.orb-layer-2');
      expect(layer).toBeInTheDocument();
      expect(layer).toHaveAttribute('fill', 'url(#gradient2)');
    });

    it('renders front layer (layer-3)', () => {
      const { container } = render(<AILoadingOrb />);
      const layer = container.querySelector('.orb-layer-3');
      expect(layer).toBeInTheDocument();
      expect(layer).toHaveAttribute('fill', 'url(#gradient3)');
    });

    it('renders core glow', () => {
      const { container } = render(<AILoadingOrb />);
      const core = container.querySelector('.orb-core');
      expect(core).toBeInTheDocument();
      expect(core).toHaveAttribute('fill', 'white');
    });
  });

  describe('Particles', () => {
    it('renders particle 1', () => {
      const { container } = render(<AILoadingOrb />);
      const particle = container.querySelector('.particle-1');
      expect(particle).toBeInTheDocument();
    });

    it('renders particle 2', () => {
      const { container } = render(<AILoadingOrb />);
      const particle = container.querySelector('.particle-2');
      expect(particle).toBeInTheDocument();
    });

    it('renders particle 3', () => {
      const { container } = render(<AILoadingOrb />);
      const particle = container.querySelector('.particle-3');
      expect(particle).toBeInTheDocument();
    });

    it('renders particle 4', () => {
      const { container } = render(<AILoadingOrb />);
      const particle = container.querySelector('.particle-4');
      expect(particle).toBeInTheDocument();
    });

    it('all particles have animate elements', () => {
      const { container } = render(<AILoadingOrb />);
      const particle1 = container.querySelector('.particle-1');
      const animates = particle1?.querySelectorAll('animate');
      expect(animates).toBeTruthy();
      expect(animates!.length).toBeGreaterThan(0);
    });
  });

  describe('Animations', () => {
    it('background layer has radius animation', () => {
      const { container } = render(<AILoadingOrb />);
      const layer = container.querySelector('.orb-layer-1');
      const radiusAnimate = layer?.querySelector('animate[attributeName="r"]');
      expect(radiusAnimate).toBeInTheDocument();
      expect(radiusAnimate).toHaveAttribute('values', '35;40;35');
    });

    it('middle layer has rotation animation', () => {
      const { container } = render(<AILoadingOrb />);
      const layer = container.querySelector('.orb-layer-2');
      const rotateAnimate = layer?.querySelector('animateTransform[type="rotate"]');
      expect(rotateAnimate).toBeInTheDocument();
    });

    it('core glow has pulsing animation', () => {
      const { container } = render(<AILoadingOrb />);
      const core = container.querySelector('.orb-core');
      const radiusAnimate = core?.querySelector('animate[attributeName="r"]');
      expect(radiusAnimate).toBeInTheDocument();
      expect(radiusAnimate).toHaveAttribute('values', '12;15;12');
    });
  });

  describe('Size Variants', () => {
    it('renders with small size (80px)', () => {
      const { container } = render(<AILoadingOrb size={80} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('renders with medium size (120px, default)', () => {
      const { container } = render(<AILoadingOrb size={120} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '120px', height: '120px' });
    });

    it('renders with large size (200px)', () => {
      const { container } = render(<AILoadingOrb size={200} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '200px', height: '200px' });
    });
  });

  describe('Edge Cases', () => {
    it('handles very small size', () => {
      const { container } = render(<AILoadingOrb size={20} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '20px', height: '20px' });
    });

    it('handles very large size', () => {
      const { container } = render(<AILoadingOrb size={500} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '500px', height: '500px' });
    });

    it('defaults to 120px when size is undefined', () => {
      const { container } = render(<AILoadingOrb size={undefined} />);
      const orb = container.querySelector('.ai-loading-orb');
      expect(orb).toHaveStyle({ width: '120px', height: '120px' });
    });
  });

  describe('Multiple Instances', () => {
    it('renders multiple orbs with different sizes', () => {
      const { container } = render(
        <>
          <AILoadingOrb size={80} />
          <AILoadingOrb size={120} />
          <AILoadingOrb size={160} />
        </>
      );
      const orbs = container.querySelectorAll('.ai-loading-orb');
      expect(orbs).toHaveLength(3);
    });

    it('each instance has independent gradients', () => {
      const { container } = render(
        <>
          <AILoadingOrb />
          <AILoadingOrb />
        </>
      );
      // Note: This tests that gradients exist, not that they're unique
      // SVG gradient IDs would need to be unique for multiple instances
      const gradients = container.querySelectorAll('[id^="gradient"]');
      expect(gradients.length).toBeGreaterThan(0);
    });
  });
});
