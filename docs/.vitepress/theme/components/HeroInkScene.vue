<template>
  <svg class="hero-ink-scene" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="hero-sun-wash" cx="0.4" cy="0.34" r="0.78">
        <stop stop-color="var(--hero-sun)" stop-opacity="0.44" />
        <stop offset="0.62" stop-color="var(--hero-sun)" stop-opacity="0.22" />
        <stop offset="1" stop-color="var(--hero-sun)" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="hero-sun-ink" cx="0.36" cy="0.32" r="0.82">
        <stop stop-color="var(--hero-sun)" stop-opacity="0.12" />
        <stop offset="0.54" stop-color="var(--hero-sun)" stop-opacity="0.095" />
        <stop offset="1" stop-color="var(--hero-sun)" stop-opacity="0.045" />
      </radialGradient>
      <linearGradient id="hero-mist-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--hero-mist)" stop-opacity="0" />
        <stop offset="0.45" stop-color="var(--hero-mist)" stop-opacity="0.18" />
        <stop offset="1" stop-color="var(--hero-mist)" stop-opacity="0" />
      </linearGradient>
      <filter id="hero-sun-paper" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.055 0.08" numOctaves="2" seed="29" result="sun-grain" />
        <feDisplacementMap in="SourceGraphic" in2="sun-grain" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="hero-title-mask-fray" x="-12%" y="-36%" width="124%" height="172%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.08 0.35" numOctaves="1" seed="11" result="title-grain" />
        <feDisplacementMap in="SourceGraphic" in2="title-grain" scale="0.045" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <clipPath id="hero-left-depth-clip"><rect x="0" y="0" width="960" height="1080" /></clipPath>
      <clipPath id="hero-right-depth-clip"><rect x="960" y="0" width="960" height="1080" /></clipPath>
      <filter id="hero-ink-opening-fray" x="-14%" y="-20%" width="128%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.075" numOctaves="2" seed="17" result="ink-grain" />
        <feDisplacementMap in="SourceGraphic" in2="ink-grain" scale="72" xChannelSelector="R" yChannelSelector="G" result="rough-edge" />
        <feGaussianBlur in="rough-edge" stdDeviation="2.4" />
      </filter>
      <mask id="hero-title-ink-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
        <rect x="0" y="0" width="1" height="1" fill="#000" />
        <g class="hero-title-ink-reveal">
          <path d="M-0.08-0.12C0.12-0.05 0.19-0.17 0.32-0.1S0.52-0.04 0.65-0.11 0.84-0.03 1.08-0.13L1.08 1.14C0.91 1.22 0.82 1.1 0.67 1.19S0.46 1.11 0.31 1.2 0.13 1.1-0.08 1.2Z" fill="#fff" filter="url(#hero-title-mask-fray)" />
        </g>
      </mask>
      <g id="hero-left-ink-shape">
        <path d="M-455 98C-432 70-425 43-403 39-379 35-371 58-350 37-331 18-335-13-311-26-286-39-276-4-253-14-229-25-232-65-207-77-182-89-161-48-138-59-111-72-119-108-92-116-63-125-52-67-24-72 5-78 8-119 36-121 62-123 73-77 99-82 127-87 130-48 156-44 183-40 196-75 220-62 244-49 240-13 265-8 291-2 310-25 333-7 357 12 364 43 393 38 420 34 436 61 455 55L438 153C414 166 390 149 367 172 343 195 323 168 300 194 278 220 250 194 224 218 196 242 166 207 139 233 109 259 82 222 53 248 23 274-8 233-37 258-69 284-101 244-131 267-165 293-196 246-229 269-266 296-297 251-330 276-368 303-400 259-431 281-449 232-464 183-455 98Z" fill="#fff" />
      </g>
      <g id="hero-right-ink-shape">
        <path d="M-407 317C-391 281-370 258-359 228-347 198-320 205-309 171-297 138-314 121-288 97-263 72-226 96-212 60-198 22-229 0-201-34-175-65-139-31-119-68-98-106-128-151-95-180-63-208-32-168-7-205 18-242 41-297 75-293 110-290 100-222 134-206 165-190 202-223 223-191 245-159 215-121 249-101 282-82 325-104 341-71 358-37 329 1 364 22 398 43 426 83 463 104L440 205C413 228 385 207 360 235 335 262 303 236 278 270 250 303 221 269 193 301 165 334 139 299 109 334 78 369 47 331 17 364-16 401-45 359-78 394-112 430-144 391-178 422-214 455-248 408-282 442-322 480-358 436-391 456-410 414-427 371-407 317Z" fill="#fff" />
      </g>
      <mask id="hero-far-opening-mask" maskUnits="userSpaceOnUse" mask-type="luminance" x="0" y="0" width="1920" height="1080">
        <rect width="1920" height="1080" fill="#000" />
        <g transform="translate(330 850)"><g class="hero-left-far-reveal"><use class="hero-ink-reveal-shape" href="#hero-left-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
        <g transform="translate(1505 600)"><g class="hero-right-far-reveal"><use class="hero-ink-reveal-shape" href="#hero-right-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
      </mask>
      <mask id="hero-mid-opening-mask" maskUnits="userSpaceOnUse" mask-type="luminance" x="0" y="0" width="1920" height="1080">
        <rect width="1920" height="1080" fill="#000" />
        <g transform="translate(330 850)"><g class="hero-left-mid-reveal"><use class="hero-ink-reveal-shape" href="#hero-left-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
        <g transform="translate(1505 600)"><g class="hero-right-mid-reveal"><use class="hero-ink-reveal-shape" href="#hero-right-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
      </mask>
      <mask id="hero-foreground-opening-mask" maskUnits="userSpaceOnUse" mask-type="luminance" x="0" y="0" width="1920" height="1080">
        <rect width="1920" height="1080" fill="#000" />
        <g transform="translate(330 850)"><g class="hero-left-foreground-reveal"><use class="hero-ink-reveal-shape" href="#hero-left-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
        <g transform="translate(1505 600)"><g class="hero-right-foreground-reveal"><use class="hero-ink-reveal-shape" href="#hero-right-ink-shape" filter="url(#hero-ink-opening-fray)" /></g></g>
      </mask>
    </defs>

    <g class="hero-sun" filter="url(#hero-sun-paper)">
      <path d="M1402 260C1403 241 1414 224 1433 218 1451 212 1468 219 1481 230 1493 241 1502 257 1496 275 1489 293 1473 303 1453 305 1435 307 1418 298 1408 284 1403 277 1401 269 1402 260Z" fill="url(#hero-sun-wash)" />
      <path d="M1413 265C1412 249 1426 232 1442 231 1459 230 1476 244 1479 260 1483 277 1470 290 1455 292 1437 295 1418 282 1413 265Z" fill="url(#hero-sun-ink)" />
    </g>
    <g class="hero-far-mountains">
      <image class="hero-final-layer hero-left-far-layer" href="/images/hero-far-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" />
      <image class="hero-final-layer hero-right-far-layer" href="/images/hero-far-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" />
      <image class="hero-opening-layer hero-left-far-layer" href="/images/hero-far-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" mask="url(#hero-far-opening-mask)" />
      <image class="hero-opening-layer hero-right-far-layer" href="/images/hero-far-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" mask="url(#hero-far-opening-mask)" />
    </g>
    <g class="hero-mid-mountains">
      <image class="hero-final-layer hero-left-mid-layer" href="/images/hero-mid-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" />
      <image class="hero-final-layer hero-right-mid-layer" href="/images/hero-mid-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" />
      <image class="hero-opening-layer hero-left-mid-layer" href="/images/hero-mid-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" mask="url(#hero-mid-opening-mask)" />
      <image class="hero-opening-layer hero-right-mid-layer" href="/images/hero-mid-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" mask="url(#hero-mid-opening-mask)" />
    </g>
    <g class="hero-foreground">
      <image class="hero-final-layer hero-left-near-layer" href="/images/hero-foreground-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" />
      <image class="hero-final-layer hero-right-near-layer" href="/images/hero-foreground-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" />
      <image class="hero-opening-layer hero-left-near-layer" href="/images/hero-foreground-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-left-depth-clip)" mask="url(#hero-foreground-opening-mask)" />
      <image class="hero-opening-layer hero-right-near-layer" href="/images/hero-foreground-layer.png" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" clip-path="url(#hero-right-depth-clip)" mask="url(#hero-foreground-opening-mask)" />
    </g>
    <g class="hero-mist">
      <g class="hero-mist-breath">
        <path d="M0 774C92 750 156 785 233 764 314 742 366 783 448 760 524 738 573 774 659 754L740 802C656 824 597 797 519 822 436 849 365 808 285 831 198 855 108 816 0 841Z" fill="url(#hero-mist-wash)" />
        <path d="M1115 761C1200 736 1266 775 1344 752 1422 729 1489 771 1567 748 1646 724 1727 759 1793 741L1920 777 1920 850C1846 832 1776 867 1691 843 1611 821 1548 859 1470 835 1386 809 1329 850 1252 824 1201 806 1165 809 1115 822Z" fill="url(#hero-mist-wash)" />
        <path d="M658 693C743 678 806 704 879 686 948 669 1005 699 1070 684 1121 673 1163 688 1206 701L1193 741C1124 729 1074 753 1001 736 929 719 872 747 803 726 748 709 710 726 658 731Z" fill="url(#hero-mist-wash)" opacity="0.66" />
      </g>
    </g>
  </svg>
</template>
