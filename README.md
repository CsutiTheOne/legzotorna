# Legzotorna webalkamazás #

Ez a régi legzotorna.hu-nak egy kicsit komplexebb, feljavítottabb, extra designolt verziója.

### Mit tud? ###

* Alapvetően megjelenít minden statikus információt mint a régi oldal.
* Lehetőség van adminisztrálni.
* A webáruház flow-ja korszerűbb.

### Útvonalak ###

* INDEX ÚTVONALAK (GET)
    1. '/': Üres, átirányít '/fooldal'-ra
    2. '/fooldal': ez pontt csak a főoldal minden nyitóinformációval
    3. '/rolam': Itt van egy személyes leírás a légzőtorna anyjáról
    4. '/tapasztalatok': Ez egy lista tapasztalat idézetekről
    5. '/vasarlas: Ez a webshop
* ADMIN ÚTVONALAK "/admin"-al kezdődnek (GET)
    1. '/': vagy bejelentkezés vagy a főoldal, ahol meg lehet nyitni a beállításokat
    2. '/users': Lista a regisztrált felhasználókról
    3. '/usres/invite': Új felhasználó meghívása űrlap (ha minden fasza)
    4. '/users/:user': Egy adott felhasználó megjelenítése, és (ha van hozzá jog) jogainak szerkesztése
    5. '/settings': A webalkalmazás beállításainak módosítása (amiből nincs sok)
    6. '/products': Lista a termémekről, amik elérhetőek a webáruházban
    7. '/products/new': Új termék hozzáadása űrlap
    8. '/products/:product': Létező termék módosítása űrlap
    9. +'/:registration_token': Ha van kiküldve ilyen link, azon keresztül lehet regisztrálni
    10. '/orders'
* API útvonalak "/api"-al kezdődnek (GET,PUT,POST,DELETE)(ITT TÖRTÉNIK A VARÁZSLAT)
    * Authentikáció
        1. '/auth/login': bejelentkezés
        2. '/auth/register_token': regisztráció (megint csak, ha van ilyen token)
    * Felhasználók
        1. '/users': GET tömb az összes felhasználóról
        2. '/users/:user': GET 1 felhasználó PUT felhasználó adatainak módosítása DELETE felhasználó törlése
        3.
    * TERMÉKEK
    * RENDELÉSEK









asd
