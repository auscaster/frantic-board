# Pass Fixture

This is a valid relative link to a file in the same directory:
[Exists](./exists.txt)

This is a valid relative link to a file in the parent repository structure:
[Readme](../../../../README.md)

This is an image tag pointing to a valid file:
![Image](./exists.txt)

These are external links, anchors, and emails which should be skipped and not cause a failure:
* [Google](https://google.com)
* [Self Anchor](#pass-fixture)
* [Email Us](mailto:info@gofrantic.com)
