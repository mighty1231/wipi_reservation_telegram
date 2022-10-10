import axios from 'axios';

class WipiAPIService {
    constructor(server_url, personal_token, store_id,  payment_id) {
        this.server_url = server_url;
        this.store_id = store_id;
        this.personal_token = personal_token;
        this.payment_id = payment_id;
    }

    async get_teachers() {
        const response = await axios({
            method: 'get',
            url: `${this.server_url}/store/teachers`,
            params: {
                id: this.store_id,
            },
            headers: {
                'Authorization': `Basic ${this.personal_token}`,
            },
        });

        return response.data;
    }

    async get_reservable() {
        const response = await axios({
            method: 'get',
            url: `${this.server_url}/lesson/reservable`,
            params: {
                storeId: this.store_id,
                paymentId: this.payment_id,
                academyType: 'piano',
            },
            headers: {
                'Authorization': `Basic ${this.personal_token}`,
            },
        });

        return response.data;
    }
}

// export
export default WipiAPIService;
