# CSS Validation

This folder shows how I checked my CSS files to make sure they work properly.

## What I Did

1. I checked all CSS files using the [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)
2. I fixed the errors that would affect the website
3. I took screenshots of before and after

## Results

| File | Before | After |
|------|--------|-------|
| style.css | 2 errors, 84 warnings | 0 errors, 84 warnings |
| dashboard_style.css | 0 errors, some warnings | 0 errors, same warnings |

### About The Warnings

Most warnings are for:

- CSS variables (--color-primary, etc.)
- Browser compatibility code (-webkit- prefixes)
- Other technical things

These warnings don't hurt the website and some are needed for features to work.

## Screenshots

- Error screenshots: [See errors folder](images/errors/)
- Passing validation: [See pass folder](images/pass/)

## More Details

For the full story about what I fixed in style.css, see [style-css-validation.md](style-css-validation.md)
