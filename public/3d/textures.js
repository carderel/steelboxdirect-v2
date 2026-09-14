/**
 * textures.js
 * Generates ultra-high-resolution procedural canvas-based PBR textures
 * for the 3D Shipping Container, matching the user's reference photos.
 */

export function createWoodFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base marine-grade Apitong / Keruing hardwood color (matching reference photo 1)
  ctx.fillStyle = '#7a5435';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Planks layout: 20 horizontal plank boards along the container
  const numPlanks = 20;
  const plankHeight = canvas.height / numPlanks;

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    
    // Varying wood tones for authentic laminated plywood / plank look
    const hueVariation = (Math.sin(i * 3.7) * 9);
    const lightVariation = (Math.cos(i * 2.1) * 14);
    ctx.fillStyle = `hsl(${26 + hueVariation}, ${46 + lightVariation * 0.4}%, ${33 + lightVariation}%)`;
    ctx.fillRect(0, y, canvas.width, plankHeight);

    // Fine wood grain fibers
    ctx.save();
    ctx.strokeStyle = 'rgba(38, 20, 8, 0.28)';
    ctx.lineWidth = 1.2;
    for (let g = 0; g < 45; g++) {
      const gy = y + Math.random() * plankHeight;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      let curX = 0;
      let curY = gy;
      while (curX < canvas.width) {
        curX += 35 + Math.random() * 70;
        curY += (Math.random() - 0.5) * 3.5;
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Occasional subtle wood knots and grain whirls
    if (i % 2 === 0) {
      for (let k = 0; k < 3; k++) {
        const kx = (k + 0.35 + (i * 0.28) % 1) * (canvas.width / 3.2);
        const ky = y + plankHeight * (0.3 + (k * 0.2) % 0.4);
        ctx.save();
        ctx.fillStyle = 'rgba(40, 18, 6, 0.48)';
        ctx.beginPath();
        ctx.ellipse(kx, ky, 16, 5, Math.PI / 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Plank seam / groove shadow & highlight
    ctx.fillStyle = 'rgba(20, 10, 4, 0.78)';
    ctx.fillRect(0, y + plankHeight - 3.5, canvas.width, 3.5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, y, canvas.width, 1.5);
  }

  // Cross-seams (butt joints between 2.4m plywood panel sections)
  const numPanels = 5;
  const panelWidth = canvas.width / numPanels;
  for (let p = 1; p < numPanels; p++) {
    const px = p * panelWidth;
    ctx.fillStyle = 'rgba(18, 8, 4, 0.85)';
    ctx.fillRect(px - 2.5, 0, 5, canvas.height);
  }

  // Countersunk floor screw fasteners into steel crossmembers
  // Crossmembers spaced every ~35cm (32 rows across container)
  const numCrossmembers = 32;
  ctx.strokeStyle = '#5a524a';
  ctx.lineWidth = 1;
  for (let c = 1; c < numCrossmembers; c++) {
    const cx = (c / numCrossmembers) * canvas.width;
    for (let r = 0; r < numPlanks; r++) {
      const cy = (r + 0.5) * plankHeight;
      // Screw head recess
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#322d28';
      ctx.fill();
      ctx.stroke();

      // Screw drive cross slot
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy);
      ctx.lineTo(cx + 2, cy);
      ctx.moveTo(cx, cy - 2);
      ctx.lineTo(cx, cy + 2);
      ctx.strokeStyle = '#14100c';
      ctx.stroke();
    }
  }

  return canvas;
}

export function createCortenMetalTexture(baseColorHex = '#f2f2f2') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Micro surface noise / industrial orange peel paint texture
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle vertical weathering wash
  ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
  for (let s = 0; s < 35; s++) {
    const sx = Math.random() * canvas.width;
    const sw = 10 + Math.random() * 40;
    ctx.fillRect(sx, 0, sw, canvas.height);
  }

  return canvas;
}

export function createHazardStripeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Safety Yellow background
  ctx.fillStyle = '#f5b800';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Matte Black 45-degree warning chevrons (as on top headers in photo 2 & 3)
  ctx.fillStyle = '#1c1c1c';
  const stripeWidth = 50;
  for (let x = -canvas.height * 2; x < canvas.width + canvas.height * 2; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + canvas.height, canvas.height);
    ctx.lineTo(x + canvas.height, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  return canvas;
}

export function createDoorDecalsTexture(textColor = '#ffffff', config = {}) {
  const {
    isoCode = '45G1',
    bicPrefix = 'LTSU  472404 5',
    isHighCube = true,
    maxGrossKg = '32,500 KG',
    maxGrossLbs = '71,650 LBS',
    tareKg = '3,900 KG',
    tareLbs = '8,600 LBS',
    payloadKg = '28,600 KG',
    payloadLbs = '63,050 LBS',
    cuM = '76.4 CU.M',
    cuFt = '2,700 CU.FT'
  } = config;

  // Exterior Right Door Decals (Industry standard: black stencil on orange/yellow, white on dark)
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Stencil font styling
  ctx.fillStyle = textColor;
  ctx.font = 'bold 64px "Courier New", monospace';
  ctx.textAlign = 'left';

  // Container BIC Code
  ctx.fillText(bicPrefix, 140, 240);
  
  // ISO Size and Type Code
  ctx.font = 'bold 54px "Courier New", monospace';
  ctx.fillText(isoCode, 140, 320);

  let sy = 380;

  if (isHighCube) {
    // Yellow High Cube Warning Badge (Mandatory only on 9'6" containers)
    ctx.fillStyle = '#f2a900';
    ctx.fillRect(140, 360, 160, 80);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('45', 220, 400);
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('HIGH', 220, 428);

    // Height Warning Triangle Symbol
    ctx.fillStyle = '#f2a900';
    ctx.beginPath();
    ctx.moveTo(220, 460);
    ctx.lineTo(280, 560);
    ctx.lineTo(160, 560);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText('!', 220, 540);

    sy = 640;
  }

  // Specifications block (Metric & Imperial)
  ctx.fillStyle = textColor;
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.textAlign = 'left';
  
  const specs = [
    `MAX. GROSS   ${maxGrossKg}`,
    `             ${maxGrossLbs}`,
    '',
    `TARE          ${tareKg}`,
    `              ${tareLbs}`,
    '',
    `PAYLOAD      ${payloadKg}`,
    `             ${payloadLbs}`,
    '',
    `CU. CAP.       ${cuM}`,
    `              ${cuFt}`
  ];

  specs.forEach(line => {
    if (line) ctx.fillText(line, 140, sy);
    sy += 42;
  });

  // CSC Safety Approval Consolidated Data Plate (Stainless steel rectangular plate)
  const plateX = 140;
  const plateY = isHighCube ? 1200 : 1000;
  const plateW = 460;
  const plateH = 300;

  ctx.fillStyle = '#c8d0d8';
  ctx.fillRect(plateX, plateY, plateW, plateH);
  ctx.strokeStyle = '#3a424a';
  ctx.lineWidth = 5;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  // 4 Corner Rivets
  ctx.fillStyle = '#222';
  [[plateX+16, plateY+16], [plateX+plateW-16, plateY+16], [plateX+16, plateY+plateH-16], [plateX+plateW-16, plateY+plateH-16]].forEach(([rx, ry]) => {
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#111';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CSC SAFETY APPROVAL', plateX + plateW / 2, plateY + 45);
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('DATE MANUFACTURED: 2024 / 08', plateX + plateW / 2, plateY + 80);
  ctx.fillText(`IDENTIFICATION NO: ${bicPrefix.replace(/\s+/g, ' ')}`, plateX + plateW / 2, plateY + 112);
  ctx.fillText(`MAXIMUM OPERATING GROSS: ${maxGrossKg}`, plateX + plateW / 2, plateY + 144);
  ctx.fillText('ALLOWABLE STACKING WEIGHT: 192,000 KG', plateX + plateW / 2, plateY + 176);
  ctx.fillText('TRANSVERSE RACKING TEST: 15,240 KG', plateX + plateW / 2, plateY + 208);
  ctx.fillText('TIMBER TREATMENT: AQIS IMMERSION', plateX + plateW / 2, plateY + 240);
  ctx.fillText('CUSTOMS SEAL APPROVED (ISO 17712)', plateX + plateW / 2, plateY + 270);

  return canvas;
}

export function createInteriorDoorDecalsTexture(side = 'left') {
  // Generates the authentic interior door markings from reference photo 1
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Top Caution Placard
  const cardX = 140;
  const cardY = 220;
  const cardW = 460;
  const cardH = 460;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#cc1111';
  ctx.lineWidth = 8;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = '#cc1111';
  ctx.font = 'bold 44px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAUTION', cardX + cardW / 2, cardY + 65);

  ctx.fillStyle = '#111111';
  ctx.font = 'bold 18px Arial, sans-serif';
  const rules = [
    'OPERATIONAL SAFETY MANDATE',
    '--------------------------------------',
    '1. SECURE ALL LOCKING RODS PRIOR TO TRANSIT',
    '2. ENSURE CAMS ARE FULLY SEATED IN KEEPERS',
    '3. DISTRIBUTE CARGO WEIGHT EVENLY',
    '4. DO NOT EXCEED CONCENTRATED FLOOR LOADS',
    '5. TIMBER TREATED FOR QUARANTINE (AQIS)',
    '6. DO NOT CUT, DRILL OR WELD CORTEN PANELS',
    '7. CHECK EPDM SEALS FOR INTEGRITY'
  ];

  let ry = cardY + 115;
  rules.forEach(r => {
    ctx.fillText(r, cardX + cardW / 2, ry);
    ry += 36;
  });

  // Authentic stencil markings below placard (matching photo 1)
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = 'left';

  let stencils = [];
  if (side === 'left') {
    stencils = [
      'LTSU   DRESS   287204 VCTT',
      'g.6 f  TBB032         3300',
      'qnt L  339L6       13636BS',
      'n Cet. 1383.18.5   13637BS',
      'm Ceff OIL 0/4.6   500 Uft'
    ];
  } else {
    stencils = [
      'LTSU DRESS    SHEER   33.5',
      'CABE          2.000T  36 g',
      'PAROAD        2.000   1 lkg',
      'CL CAP.       40.000  lbs ft',
      '              2.65 Crt lbs ft'
    ];
  }

  let sy = 780;
  stencils.forEach(s => {
    ctx.fillText(s, 140, sy);
    sy += 48;
  });

  return canvas;
}
