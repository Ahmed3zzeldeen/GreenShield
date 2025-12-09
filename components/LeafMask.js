import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Defs, Mask, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const LeafMask = () => {
  // CONFIGURATION
  // We subtract 150px (approx controls + tab bar height) to find the visual center
  // This ensures the leaf isn't hidden behind the bottom buttons
  const visualHeight = height - 150; 
  
  const cx = width / 2;
  const cy = visualHeight / 2; 
  
  // Corn Leaf dimensions - Taller and Narrower than generic leaf
  const leafWidth = width * 0.35;  
  const leafHeight = visualHeight * 0.65; 
  
  // Key points
  const topY = cy - leafHeight / 2;
  const bottomY = cy + leafHeight / 2;
  
  // SVG Path for a Corn Leaf (Long, slender, lanceolate shape)
  // Starts at bottom center, curves wide at the lower third, then tapers to a sharp point
  const leafPath = `
    M ${cx} ${bottomY}
    C ${cx - leafWidth} ${bottomY - leafHeight * 0.2}, ${cx - leafWidth * 0.6} ${topY + leafHeight * 0.2}, ${cx} ${topY}
    C ${cx + leafWidth * 0.6} ${topY + leafHeight * 0.2}, ${cx + leafWidth} ${bottomY - leafHeight * 0.2}, ${cx} ${bottomY}
    Z
  `;

  return (
    <Svg height="100%" width="100%" style={{ position: 'absolute', zIndex: 1 }}>
      <Defs>
        <Mask id="mask">
          <Rect x="0" y="0" width={width} height={height} fill="white" />
          <Path d={leafPath} fill="black" />
        </Mask>
      </Defs>
      
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.6)"
        mask="url(#mask)"
      />
      
      <Path 
        d={leafPath} 
        stroke="rgba(255, 255, 255, 0.6)" 
        strokeWidth="3" 
        strokeDasharray="10, 5" 
        fill="transparent" 
      />
    </Svg>
  );
};

export default LeafMask;