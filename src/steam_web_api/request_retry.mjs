import authenticate from './authenticate.mjs'

const MAX_ATTEMPTS = 5

async function retryUntil200(url, current_attempt = 0, max_attempts = MAX_ATTEMPTS) {
    let response = await fetch(authenticate(url))

    switch (response.status) {
        case 200:
            return await response.json()
        default:
            console.debug(response.status)

            if (current_attempt < max_attempts) {

                let delay = ++current_attempt * 2000
                console.debug(`Retry ${current_attempt + 1} after ${delay}ms`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return await retryUntil200(url, current_attempt, max_attempts);

            }
            else {
                throw new Error(`Failed after ${max_attempts} attempts`);
            }
    }
}

export default retryUntil200