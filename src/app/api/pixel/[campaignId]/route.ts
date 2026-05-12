import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pixels } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    
    // Get pixel settings
    const pixel = await db.query.pixels.findFirst({
      where: eq(pixels.campaignId, campaignId),
    });

    if (!pixel) {
      return new NextResponse('// Pixel not found', {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate the tracking JavaScript
    const script = `
(function() {
  'use strict';
  
  var LAN = window.LAN || {};
  LAN.campaignId = '${campaignId}';
  LAN.pixelCode = '${pixel.pixelCode}';
  LAN.endpoint = '${baseUrl}/api/convert';
  
  // Get click_id from URL or cookie
  function getClickId() {
    var urlParams = new URLSearchParams(window.location.search);
    var clickId = urlParams.get('click_id');
    
    if (clickId) {
      // Store in cookie for future conversions
      document.cookie = 'lan_click_id=' + clickId + '; max-age=2592000; path=/';
      return clickId;
    }
    
    // Try to get from cookie
    var match = document.cookie.match(/lan_click_id=([^;]+)/);
    return match ? match[1] : null;
  }
  
  // Track conversion
  LAN.track = function(type, value, metadata) {
    var clickId = getClickId();
    if (!clickId) {
      console.warn('LAN: No click_id found, conversion not tracked');
      return;
    }
    
    var data = {
      click_id: clickId,
      type: type || 'lead',
      value: value || null,
      metadata: metadata || {}
    };
    
    // Send conversion
    fetch(LAN.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(response) {
      if (response.ok) {
        console.log('LAN: Conversion tracked successfully');
      }
    }).catch(function(error) {
      console.error('LAN: Failed to track conversion', error);
    });
  };
  
  // Auto-track page view as lead (optional)
  LAN.trackPageView = function() {
    var clickId = getClickId();
    if (clickId) {
      // Fire pixel image
      var img = new Image();
      img.src = LAN.endpoint + '?click_id=' + clickId + '&t=' + Date.now();
    }
  };
  
  window.LAN = LAN;
  
  // Auto-initialize
  if (document.readyState === 'complete') {
    LAN.trackPageView();
  } else {
    window.addEventListener('load', LAN.trackPageView);
  }
})();
`;

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Pixel script error:', error);
    return new NextResponse('// Error loading pixel', {
      headers: { 'Content-Type': 'application/javascript' },
    });
  }
}
