# bigpannel
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up | Big Hosting by BigManJ Tech™</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="brand-header">
                <h1>Big Hosting™</h1>
                <p>by BigManJ Tech</p>
            </div>
            
            <h2>Create Your Account</h2>
            <p class="sub-text">Deploy your bots in seconds with Mobile Money or Card.</p>

            <form id="registerForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="fullName" placeholder="e.g., Hamza Juma" required>
                </div>

                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" placeholder="you@example.com" required>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" placeholder="Min 8 characters" minlength="8" required>
                </div>

                <!-- COUNTRY SELECTION -->
                <div class="form-group">
                    <label>Country <span class="required">*</span></label>
                    <select id="country" required>
                        <option value="">-- Select your country --</option>
                        <option value="Tanzania">🇹🇿 Tanzania</option>
                        <option value="Kenya">🇰🇪 Kenya</option>
                        <option value="Uganda">🇺🇬 Uganda</option>
                        <option value="Nigeria">🇳🇬 Nigeria</option>
                        <option value="South Africa">🇿🇦 South Africa</option>
                        <option value="United States">🇺🇸 United States</option>
                        <option value="United Kingdom">🇬🇧 United Kingdom</option>
                        <option value="Other">🌍 Other</option>
                    </select>
                </div>

                <!-- PHONE NUMBER (Only visible if Tanzania is selected) -->
                <div class="form-group hidden" id="phoneGroup">
                    <label>Mobile Number (For M-Pesa / Tigo Pesa)</label>
                    <div class="phone-input-wrapper">
                        <span class="country-code">+255</span>
                        <input type="tel" id="phone" placeholder="712 345 678">
                    </div>
                    <small>We'll send a payment request to this number when you purchase.</small>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="terms" required>
                        I agree to the <a href="/terms.html">Terms of Service</a> and <a href="/privacy.html">Privacy Policy</a>.
                    </label>
                </div>

                <button type="submit" id="registerBtn">Create Account 🚀</button>

                <div id="registerStatus" class="status-msg"></div>

                <p class="auth-switch">
                    Already have an account? <a href="/login.html">Log In</a>
                </p>
            </form>

            <div class="footer-copyright">
                © 2026 Big Hosting by BigManJ Tech™. All rights reserved.
            </div>
        </div>
    </div>

    <script>
        // Dynamic Phone Field Logic
        const countrySelect = document.getElementById('country');
        const phoneGroup = document.getElementById('phoneGroup');
        const phoneInput = document.getElementById('phone');
        const registerForm = document.getElementById('registerForm');
        const statusDiv = document.getElementById('registerStatus');
        const btn = document.getElementById('registerBtn');

        countrySelect.addEventListener('change', function() {
            if (this.value === 'Tanzania') {
                phoneGroup.classList.remove('hidden');
                phoneInput.required = true;
            } else {
                phoneGroup.classList.add('hidden');
                phoneInput.required = false;
                phoneInput.value = '';
            }
        });

        // Handle Registration
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            statusDiv.innerHTML = '';
            btn.disabled = true;
            btn.textContent = 'Creating Account...';

            const payload = {
                full_name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                country: countrySelect.value,
                phone: phoneInput.value || null,
            };

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok) {
                    statusDiv.style.color = 'green';
                    statusDiv.innerHTML = '✅ Account created! Redirecting to login...';
                    setTimeout(() => window.location.href = '/login.html', 1500);
                } else {
                    statusDiv.style.color = 'red';
                    statusDiv.innerHTML = '❌ ' + (data.error || 'Registration failed. Please try again.');
                }
            } catch (err) {
                statusDiv.style.color = 'red';
                statusDiv.innerHTML = '❌ Network error. Check your connection.';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account 🚀';
            }
        });
    </script>
</body>
</html>