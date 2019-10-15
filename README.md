# The `co` kata

## Implement a Simple Coroutine Runner

This is pretty much how `async`/`await` works behind the scenes, except you won’t be using `async`/`await` syntax. Instead, you will create a function called `co` (or whatever you’d like to call it) that will accept a generator function and return a promise that resolves to the return value from the generator. You may call `yield` on any thenable values within the generator (bonus points for thunks too).

For example, the following two expressions should be the same:

```js
getValueFromPromise1()
  .then(val1 => Promise.all([val1, getValueFromPromise2(val1)]))
  .then(([val1, val2]) => getValueFromPromise3(val1, val2));
```

```js
co(function* () {
  const val1 = yield getValueFromPromise1();
  const val2 = yield getValueFromPromise2(val1);
  return getValueFromPromise3(val1, val2);
});
```
