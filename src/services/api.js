const API_URL = 'http://localhost:8080/api/user/avatar';

const getAvatar = async (token) => {
    const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch avatar');
    }

    return await response.json();
};

const updateAvatar = async (token, avatarData) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(avatarData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update avatar');
    }

    return await response.json();
};

export default {
    getAvatar,
    updateAvatar
};
