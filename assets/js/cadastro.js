document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const cadastroForm = document.getElementById('cadastroForm');
    const btnCancelar = document.getElementById('btnCancelar');

    // Remover event listeners duplicados do HTML inline
    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach(script => {
        if (script.innerHTML.includes('togglePassword')) {
            script.remove();
        }
    });

    // Password visibility toggles - Implementação corrigida
    function setupPasswordToggle(toggleId, passwordId) {
        const toggleBtn = document.getElementById(toggleId);
        const passwordField = document.getElementById(passwordId);
        
        if (toggleBtn && passwordField) {
            // Remove listeners existentes para evitar duplicação
            toggleBtn.replaceWith(toggleBtn.cloneNode(true));
            const newToggleBtn = document.getElementById(toggleId);
            
            newToggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = this.querySelector('i');
                
                if (passwordField.type === 'password') {
                    passwordField.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    passwordField.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
                
                // Manter o foco no campo de senha
                passwordField.focus();
            });
        }
    }

    // Configurar toggles de senha
    setupPasswordToggle('togglePassword', 'senha');
    setupPasswordToggle('toggleConfirmPassword', 'confirmarSenha');

    // Password strength checker
    function checkPasswordStrength(password) {
        let score = 0;
        let feedback = '';

        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthFill = document.getElementById('passwordStrengthFill');
        const strengthText = document.getElementById('passwordStrengthText');

        if (!strengthFill || !strengthText) return false;

        if (password.length === 0) {
            strengthFill.className = 'password-strength-fill';
            strengthText.innerHTML = '<i class="bi bi-info-circle me-1"></i>Mínimo 6 caracteres, inclua números e símbolos';
            return false;
        }

        if (score < 3) {
            strengthFill.className = 'password-strength-fill password-strength-weak';
            feedback = '<i class="bi bi-exclamation-triangle me-1"></i>Senha fraca - adicione mais caracteres';
        } else if (score < 4) {
            strengthFill.className = 'password-strength-fill password-strength-fair';
            feedback = '<i class="bi bi-info-circle me-1"></i>Senha razoável - adicione símbolos ou números';
        } else if (score < 5) {
            strengthFill.className = 'password-strength-fill password-strength-good';
            feedback = '<i class="bi bi-check-circle me-1"></i>Senha boa - quase perfeita!';
        } else {
            strengthFill.className = 'password-strength-fill password-strength-strong';
            feedback = '<i class="bi bi-shield-check me-1"></i>Senha muito forte!';
        }

        strengthText.innerHTML = feedback;
        return score >= 3;
    }

    // Password match checker
    function checkPasswordMatch() {
        const password = document.getElementById('senha').value;
        const confirmPassword = document.getElementById('confirmarSenha').value;
        const matchMessage = document.getElementById('passwordMatchMessage');

        if (!matchMessage) return false;

        if (confirmPassword === '') {
            matchMessage.innerHTML = '';
            return false;
        }

        if (password === confirmPassword) {
            matchMessage.innerHTML = '<i class="bi bi-check-circle me-1"></i>Senhas coincidem';
            matchMessage.className = 'form-text small mt-1 password-match-success';
            return true;
        } else {
            matchMessage.innerHTML = '<i class="bi bi-x-circle me-1"></i>Senhas não coincidem';
            matchMessage.className = 'form-text small mt-1 password-match-error';
            return false;
        }
    }

    // Form validation
    function validateForm() {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const aceitoTermos = document.getElementById('aceitoTermos').checked;
        const btnCadastrar = document.getElementById('btnCadastrar');

        if (!btnCadastrar) return false;

        const isPasswordStrong = checkPasswordStrength(senha);
        const passwordsMatch = checkPasswordMatch();
        
        // Validação de email mais robusta
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(email);
        
        const isValid = nome.length >= 2 && 
                       isEmailValid && 
                       senha.length >= 6 && 
                       isPasswordStrong &&
                       passwordsMatch &&
                       aceitoTermos;

        btnCadastrar.disabled = !isValid;
        return isValid;
    }

    // Event listeners para validação em tempo real
    const nomeField = document.getElementById('nome');
    const emailField = document.getElementById('email');
    const senhaField = document.getElementById('senha');
    const confirmarSenhaField = document.getElementById('confirmarSenha');
    const aceitoTermosField = document.getElementById('aceitoTermos');

    if (nomeField) {
        nomeField.addEventListener('input', validateForm);
    }

    if (emailField) {
        emailField.addEventListener('input', validateForm);
    }

    if (senhaField) {
        senhaField.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            if (confirmarSenhaField && confirmarSenhaField.value) {
                checkPasswordMatch();
            }
            validateForm();
        });
    }

    if (confirmarSenhaField) {
        confirmarSenhaField.addEventListener('input', function() {
            checkPasswordMatch();
            validateForm();
        });
    }

    if (aceitoTermosField) {
        aceitoTermosField.addEventListener('change', validateForm);
    }

    // Error message display
    function showError(message) {
        const errorDiv = document.getElementById('mensagemErro');
        const errorText = document.getElementById('mensagemErroTexto');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('d-none');
            
            // Auto-hide após 5 segundos
            setTimeout(() => {
                errorDiv.classList.add('d-none');
            }, 5000);
        }
    }

    // Success message display
    function showSuccess(message) {
        const successDiv = document.getElementById('mensagemSucesso');
        const successText = document.getElementById('mensagemSucessoTexto');
        
        if (successDiv && successText) {
            successText.textContent = message;
            successDiv.classList.remove('d-none');
        }
    }

    // Reset form state
    function resetForm() {
        const button = document.getElementById('btnCadastrar');
        const spinner = document.getElementById('loadingSpinner');
        
        if (button && spinner) {
            button.disabled = false;
            spinner.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-person-plus me-2"></i>Criar Minha Conta';
        }
    }

    // Form submission
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateForm()) {
                showError('Por favor, corrija os erros no formulário antes de continuar.');
                return;
            }

            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            const newsletter = document.getElementById('newsletter').checked;

            // Loading state
            const button = document.getElementById('btnCadastrar');
            const spinner = document.getElementById('loadingSpinner');
            
            if (button && spinner) {
                button.disabled = true;
                spinner.classList.remove('d-none');
                button.innerHTML = '<i class="bi bi-person-plus me-2"></i>Criando conta...<div class="spinner-border spinner-border-sm ms-2"></div>';
            }

            try {
                const response = await fetch(`${API_BASE_URL}/cadastro`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ 
                        nome, 
                        email, 
                        senha,
                        newsletter 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess('Conta criada com sucesso! Redirecionando para o login...');
                    
                    // Redirecionar após 2 segundos
                    setTimeout(() => {
                        window.location.href = 'login.html?email=' + encodeURIComponent(email);
                    }, 2000);
                } else {
                    throw new Error(data.message || 'Erro no cadastro');
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                showError(error.message || 'Erro de conexão com o servidor. Tente novamente mais tarde.');
                resetForm();
            }
        });
    }

    // Cancel button
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja cancelar o cadastro? Todos os dados serão perdidos.')) {
                window.location.href = 'index.html';
            }
        });
    }

    // Validação inicial
    validateForm();

    // Adicionar efeitos visuais aos campos
    const inputs = document.querySelectorAll('.cinema-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1.02)';
                this.parentElement.style.transition = 'transform 0.3s ease';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'scale(1)';
            }
        });
    });

    // Animação de entrada para os elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.mb-4').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Debug: Log para verificar se os toggles estão funcionando
    console.log('Cadastro.js carregado com sucesso');
    console.log('Toggle senha encontrado:', !!document.getElementById('togglePassword'));
    console.log('Toggle confirmar senha encontrado:', !!document.getElementById('toggleConfirmPassword'));
});