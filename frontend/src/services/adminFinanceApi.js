import api from "../utils/api";

export const fetchFinanceSummary = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/finance?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching finance summary:", error);
        throw error;
    }
};

export const fetchFinanceChartData = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/charts?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        // Ensure data is sorted by date
        const sortedData = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        return sortedData;
    } catch (error) {
        console.error("Error fetching finance chart data:", error);
        throw error;
    }
};

export const fetchOrderTrends = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/trends?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching order trends:", error);
        throw error;
    }
};

export const fetchPaymentBreakdown = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/payment-breakdown?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching payment breakdown:", error);
        throw error;
    }
};

export const fetchTaxReports = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/tax-reports?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tax reports:", error);
        throw error;
    }
};

export const fetchRefundReports = async (period) => {
    try {
        const adminToken = localStorage.getItem("admin-token");
        const response = await api.get(`/admin/analytics/refund-reports?period=${period}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching refund reports:", error);
        throw error;
    }
};
