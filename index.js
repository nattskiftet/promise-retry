function delay(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

class AbortError extends Error {
	constructor(message) {
		super();

		if (message instanceof Error) {
			this.message = message.message;
			this.stack = message.stack;

			for (const property in message) {
				try {
					this[property] = message[property];
				} catch (error) {
					// ... do nothing
				}
			}
		} else {
			this.message = message;
		}

		this.name = 'AbortError';
	}
}

/**
 * Retry a Promise or async function
 * @param {function} callback - the function to retry if it throws an error
 * @param {object} options - the options object
 * @param {number} options.attempts - the number of retries
 * @param {number} options.timeout - the number of milliseconds to wait between retries
 *
 * @returns {Promise}
**/
function retry(callback, options) {
	const mergedOptions = {attempts: 3, timeout: 250, ...options};

	return new Promise((resolve, reject) => (
		callback()
			.then(resolve)
			.catch(async (error) => {
				if (error instanceof AbortError) {
					reject(error);
					return;
				}

				if (mergedOptions.attempts > 1) {
					mergedOptions.attempts -= 1;

					if (mergedOptions.timeout) {
						await delay(mergedOptions.timeout);
					}

					resolve(retry(callback, mergedOptions));
					return;
				}

				reject(error);
			})
	));
}

retry.AbortError = AbortError;
module.exports = retry;
