const AuthService = {
    async login(email, password) {
        try { const user = await ApiService.login(email, password); return { success: true, user }; }
        catch (error) {
            if (error.requireOtp) throw error;
            return { success: false, message: error.message };
        }
    },
    logout() { ApiService.logout(); },
    getCurrentUser() { return ApiService.currentUser(); },
    isAuthenticated() { return !!localStorage.getItem('token'); }
};
