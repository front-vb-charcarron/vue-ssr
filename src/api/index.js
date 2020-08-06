import axios from 'axios';

export function fetchItem(id) {
    return axios.get(`http://127.0.0.1:8089/test/${ id }`);
}