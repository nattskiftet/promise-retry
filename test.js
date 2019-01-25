const retry = require('.');

/**
 * Expect a function to throw
 * @param {function} test - the test function
 * @param {function} callback - the callback
**/
async function expectToThrow(test, callback) {
	try {
		await test();
	} catch (error) {
		callback(error);
		return;
	}

	throw new Error('No error thrown.');
}

/**
 * Delay X milliseconds
 * @param {number} milliseconds - the number of milliseconds to wait
 * @returns {promise}
**/
function delay(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

test('callback with error on test failure', () => {
	const errorMessage = 'Some error';

	return expectToThrow(() => {
		throw new Error(errorMessage);
	}, (error) => {
		expect(error.message).toBe(errorMessage);
	});
});

test('failing: throw when no errors are thrown', async () => {
	try {
		await expectToThrow(() => {});
	} catch (error) {
		expect(error.message).toBe('No error thrown.');
		return;
	}

	throw new Error('No error thrown.');
});

test('wait X milliseconds', () => (
	delay(250)
));

test('should run', () => (
	retry(async () => {})
));

test('should only run one time if successful', async () => {
	let iterations = 0;

	await retry(async () => {
		iterations += 1;
		await delay(50);
	}, {timeout: 0});

	expect(iterations).toBe(1);
});

test('should run three times if erroring out', async () => {
	let iterations = 0;

	await expectToThrow(() => (
		retry(async () => {
			iterations += 1;
			throw new Error('test');
		}, {timeout: 0})
	), (error) => {
		expect(error.message).toBe('test');
	});

	expect(iterations).toBe(3);
});

test('should run five times if set to do so', async () => {
	let iterations = 0;

	await expectToThrow(() => (
		retry(async () => {
			iterations += 1;
			throw new Error('test');
		}, {attempts: 5, timeout: 0})
	), (error) => {
		expect(error.message).toBe('test');
	});

	expect(iterations).toBe(5);
});

test('should abort if AbortError is thrown', async () => {
	let iterations = 0;

	await expectToThrow(() => (
		retry(async () => {
			iterations += 1;

			if (iterations === 2) {
				throw new retry.AbortError('hehe');
			}

			throw new Error('test');
		}, {timeout: 0})
	), (error) => {
		expect(error.message).toBe('hehe');
		expect(error.name).toBe('AbortError');
	});

	expect(iterations).toBe(2);
});

test('should wait between retries if timeout is set', async () => {
	const startTime = (new Date()).getTime();
	const timeout = 100;
	let iterations = 0;

	await expectToThrow(() => (
		retry(async () => {
			iterations += 1;
			throw new Error('error');
		}, {timeout})
	), (error) => {
		expect(error.message).toBe('error');
	});

	expect(iterations).toBe(3);
	expect((new Date()).getTime() - startTime).toBeGreaterThanOrEqual(timeout * 2);
});

test('should merge AbortError with input error', async () => {
	let iterations = 0;

	await expectToThrow(() => (
		retry(async () => {
			iterations += 1;

			if (iterations === 2) {
				const error = new Error('my error');
				error.code = 'test';
				throw new retry.AbortError(error);
			}

			throw new Error('test');
		}, {timeout: 0})
	), (error) => {
		expect(error.message).toBe('my error');
		expect(error.code).toBe('test');
		expect(error.name).toBe('AbortError');
	});

	expect(iterations).toBe(2);
});
