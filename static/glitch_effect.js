// static/glitch_effect.js

(function() { // Wrap in an IIFE to avoid global conflicts

    const initLetterGlitch = (canvasId, options = {}) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with ID '${canvasId}' not found.`);
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            console.error("Failed to get 2D rendering context for canvas.");
            return;
        }

        const glitchColors = options.glitchColors || ['#2b4539', '#61dca3', '#61b3dc'];
        const glitchSpeed = options.glitchSpeed || 50; // milliseconds
        const smooth = options.smooth !== undefined ? options.smooth : true;

        let animationFrameId = null;
        let letters = [];
        let grid = { columns: 0, rows: 0 };
        let lastGlitchTime = Date.now();

        const fontSize = 16;
        const charWidth = 10;
        const charHeight = 20;

        const lettersAndSymbols = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '!', '@', '#', '$', '&', '*', '(', ')', '-', '_', '+', '=', '/',
            '[', ']', '{', '}', ';', ':', '<', '>', ',', '0', '1', '2', '3',
            '4', '5', '6', '7', '8', '9'
        ];

        const getRandomChar = () => {
            return lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
        };

        const getRandomColor = () => {
            return glitchColors[Math.floor(Math.random() * glitchColors.length)];
        };

        const hexToRgb = (hex) => {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => {
                return r + r + g + g + b + b;
            });

            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        const interpolateColor = (start, end, factor) => {
            const result = {
                r: Math.round(start.r + (end.r - start.r) * factor),
                g: Math.round(start.g + (end.g - start.g) * factor),
                b: Math.round(start.b + (end.b - start.b) * factor),
            };
            return `rgb(${result.r}, ${result.g}, ${result.b})`;
        };

        const calculateGrid = (width, height) => {
            const columns = Math.ceil(width / charWidth);
            const rows = Math.ceil(height / charHeight);
            return { columns, rows };
        };

        const initializeLetters = (columns, rows) => {
            grid = { columns, rows };
            const totalLetters = columns * rows;
            letters = Array.from({ length: totalLetters }, () => ({
                char: getRandomChar(),
                color: getRandomColor(),
                targetColor: getRandomColor(),
                colorProgress: 1, // 1 means already at target color
            }));
        };

        const drawLetters = () => {
            if (!context || letters.length === 0) return;
            const { width, height } = canvas; // Use canvas.width/height directly for drawing
            context.clearRect(0, 0, width, height);
            context.font = `${fontSize}px monospace`;
            context.textBaseline = 'top';

            // Scale text based on DPR
            const dpr = window.devicePixelRatio || 1;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            letters.forEach((letter, index) => {
                const x = (index % grid.columns) * charWidth;
                const y = Math.floor(index / grid.columns) * charHeight;
                context.fillStyle = letter.color;
                context.fillText(letter.char, x, y);
            });
        };

        const updateLetters = () => {
            if (!letters || letters.length === 0) return;

            // Update a percentage of letters
            const updateCount = Math.max(1, Math.floor(letters.length * 0.05));

            for (let i = 0; i < updateCount; i++) {
                const index = Math.floor(Math.random() * letters.length);
                if (!letters[index]) continue;

                letters[index].char = getRandomChar();
                letters[index].targetColor = getRandomColor();

                if (!smooth) {
                    letters[index].color = letters[index].targetColor;
                    letters[index].colorProgress = 1;
                } else {
                    letters[index].colorProgress = 0; // Start transition
                }
            }
        };

        const handleSmoothTransitions = () => {
            let needsRedraw = false;
            letters.forEach((letter) => {
                if (letter.colorProgress < 1) {
                    letter.colorProgress = Math.min(1, letter.colorProgress + 0.05); // Increment progress
                    const startRgb = hexToRgb(letter.color); // current color might be interpolated
                    const endRgb = hexToRgb(letter.targetColor);

                    if (startRgb && endRgb) {
                        // Recalculate current color based on original start color and target
                        // For a smooth transition, we need to know the initial color from where it started,
                        // or just keep updating `letter.color` based on the previous frame's color
                        // For simplicity, let's just make sure it's always moving towards target.
                        // The `letter.color` should be the actual displayed color.
                        const currentDisplayedRgb = hexToRgb(letter.color); // Get the RGB of the color *currently displayed*
                        if (currentDisplayedRgb) {
                           letter.color = interpolateColor(currentDisplayedRgb, endRgb, 0.2); // Smaller step for smoother visual
                        } else { // Fallback if conversion fails
                            letter.color = endRgb;
                        }
                        needsRedraw = true;
                    }
                }
            });

            if (needsRedraw) {
                drawLetters();
            }
        };


        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = parent.getBoundingClientRect();

            // Set canvas dimensions based on parent size and DPR
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Set canvas style dimensions for proper display scaling
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Adjust context for DPR, then reset for drawing
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            context.font = `${fontSize}px monospace`; // Ensure font is set after transform

            const { columns, rows } = calculateGrid(rect.width, rect.height);
            initializeLetters(columns, rows);
            drawLetters();
        };

        const animate = () => {
            const now = Date.now();
            if (now - lastGlitchTime >= glitchSpeed) {
                updateLetters();
                lastGlitchTime = now;
            }

            if (smooth) {
                handleSmoothTransitions();
            } else {
                 // If not smooth, ensure letters are drawn after updateLetters has changed colors
                drawLetters();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize and start animation
        resizeCanvas();
        animate();

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                resizeCanvas();
                animate();
            }, 100); // Debounce resize
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function (if needed for a dynamic removal, but for background it's fine)
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    };

    // Export the function to be called globally
    window.initLetterGlitch = initLetterGlitch;

})(); // End of IIFE
