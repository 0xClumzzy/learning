<script setup lang="ts">
/**
 * The Peaches brand mark.
 *
 * Geometry is kept byte-identical to the repo-root `logo.svg` so the product
 * UI and the published logo are always the same drawing. Gradient/clip ids are
 * prefixed with `pm-` to avoid colliding with any other inline SVG on the page.
 *
 * There is a regression test (`test/brand.test.ts`) asserting the body path
 * below still matches `logo.svg` — update both together.
 */
withDefaults(defineProps<{ class?: string }>(), { class: 'w-6 h-6' });
</script>

<template>
  <svg
    viewBox="0 0 512 512"
    :class="props.class"
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="pm-peach" x1="0.12" y1="0.02" x2="0.9" y2="0.98">
        <stop offset="0" stop-color="#FFE2BC" />
        <stop offset="0.4" stop-color="#F9AE76" />
        <stop offset="1" stop-color="#EC7C45" />
      </linearGradient>
      <radialGradient id="pm-blush" cx="0.72" cy="0.3" r="0.55">
        <stop offset="0" stop-color="#FF9E86" stop-opacity="0.7" />
        <stop offset="1" stop-color="#FF9E86" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="pm-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#93C468" />
        <stop offset="1" stop-color="#4C7C38" />
      </linearGradient>
      <clipPath id="pm-body">
        <path
          d="M256 190 C230 160 172 142 138 172 C102 204 92 264 112 318 C134 380 194 440 256 446 C318 440 378 380 400 318 C420 264 410 204 374 172 C340 142 282 160 256 190 Z"
        />
      </clipPath>
    </defs>

    <!-- stem -->
    <path
      d="M256 182 C250 152 254 132 268 112"
      fill="none"
      stroke="#7A5230"
      stroke-width="13"
      stroke-linecap="round"
    />

    <!-- leaf -->
    <path
      d="M270 118 C302 72 370 62 408 76 C402 124 354 154 294 148 C278 146 267 134 270 118 Z"
      fill="url(#pm-leaf)"
    />
    <path
      d="M274 142 C314 122 356 98 400 80"
      fill="none"
      stroke="#3C6A2C"
      stroke-width="7"
      stroke-linecap="round"
      opacity="0.65"
    />

    <!-- body -->
    <path
      d="M256 190 C230 160 172 142 138 172 C102 204 92 264 112 318 C134 380 194 440 256 446 C318 440 378 380 400 318 C420 264 410 204 374 172 C340 142 282 160 256 190 Z"
      fill="url(#pm-peach)"
    />

    <g clip-path="url(#pm-body)">
      <!-- blush -->
      <rect x="80" y="130" width="360" height="330" fill="url(#pm-blush)" />
      <!-- crease -->
      <path
        d="M256 168 C230 240 230 330 256 452"
        fill="none"
        stroke="#CE6A33"
        stroke-width="12"
        stroke-linecap="round"
        opacity="0.5"
      />
      <!-- highlight -->
      <ellipse
        cx="182"
        cy="252"
        rx="54"
        ry="36"
        fill="#FFFFFF"
        opacity="0.3"
        transform="rotate(-30 182 252)"
      />
    </g>
  </svg>
</template>
