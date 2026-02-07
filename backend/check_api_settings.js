import axios from 'axios';

const checkSettings = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/public/settings');
        console.log('Public Settings API Response:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error fetching settings:', error.message);
    }
};

checkSettings();
