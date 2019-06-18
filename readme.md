# @amphibian/promise-retry

promise retries

```
npm install @amphibian/promise-retry
```

## Usage

```javascript
import retry from '@amphibian/promise-retry';

async function getUsers() {
	const response = await retry(() => fetch('https://reqres.in/api/users'));
	const user = await response.json();

	return user;
}
```

### With options

```javascript
retry(() => (
	fetch('https://reqres.in/api/users').then((response) => response.json())
), {attempts: 3, timeout: 250});
```

### Intentionally aborting retries

```javascript
const fetchUsers = () => (
	fetch('https://reqres.in/api/users')
		.then((response) => {
			if (response.status === 404) {
				// This will prevent subsequent retries
				throw new retry.AbortError('resource_not_found');

				// You can also clone an existing error
				const error = new Error('my custom error');
				error.code = 'my custom property';

				// Properties from `error` are cloned
				throw new retry.AbortError(error);
			}

			return response.json();
		})
);

retry(fetchUsers, {attempts: 3})
	.catch((error) => {
		console.log(error.name); // > AbortError
	});
```

## `retry(function, options)`

### `function` _(`Function`)_

The function to retry. Should return a `Promise` or be `async`.

### `options` _(`Object`)_

#### `options.attempts` _(`Number`)_

**Default**: `3`
Number of times to retry before throwing the error from the final attempt.

#### `options.timeout` _(`Number`)_

**Default**: `250`
Number of milliseconds to wait between retries.
