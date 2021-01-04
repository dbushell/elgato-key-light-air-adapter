## Elgato Key Light Air Adapter

## Update 2021

Due to recent Mozilla changes and uncertainty around WebThings I've moved over to [Home Assistant](https://www.home-assistant.io/) which has full support for the key light. I've put this project in archive mode in case it's useful for others.

## README

This is a very early prototype based on the example adapter.

Todo:

- [x] On/off property (test device)
- [x] Brightness property (test device)
- [x] Temperature property (test device)
- [ ] Poll devices to keep track of state
- [ ] Throttle requests based on light settings
- [ ] Multiple device pairing / discovery
- [ ] Production package / readme / contributors

## example-adapter

This is a super basic and simple example of an adapter add-on for the WebThings
Gateway.

For more information, you may want to look at these:
* https://hacks.mozilla.org/2018/02/creating-an-add-on-for-the-project-things-gateway/
* https://hacks.mozilla.org/2018/02/making-a-clap-sensing-web-thing/
