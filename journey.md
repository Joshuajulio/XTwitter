# Journey

## Day 1

### Setup Project: Tema Aplikasi, Apollo Server, GraphQL

Silahkan setup project aplikasi server kamu:

- [v] Install MongoDB database pada komputer kamu atau menggunakan MongoDB Atlas
- [v] Install package yang dibutuhkan: @apollo/server, graphql dan mongodb sebagai MongoDB driver
- [v] Pilih tema sesuai dengan pilihan dan kesepakatan instructor, tuliskan dalam README github kamu
- [v] Buatlah aplikasi server GraphQL menggunakan Apollo Server dengan PORT default: 3000

### GraphQL - Apollo Server

Buatlah Aplikasi server GraphQL dengan menggunakan Apollo Server yang memiliki fungsi sebagai berikut:

- [v] Register (Mutation)
- [v] Login (Mutation)
- [v] Get Post (Query)
- [v] Add Post (Mutation)
- [v] Comment Post (Mutation)
- [v] Search User (Query)
- [v] Follow (Mutation)
- [v] Get User (Query)
- [v] Like Post (Mutation)

### MongoDB 1

Buatlah fungsi/method pada aplikasi server GraphQL kamu yang menghubungkan dengan database MongoDB dengan fungsi sebagai berikut:

- [v] Add user: untuk kebutuhan register
- [v] Get user by username dan password: untuk kebutuhan login
- [v] Search users by name/username: untuk kebutuhan mencari user berdasarkan nama atau username
- [v] Follow User: untuk kebutuhan memfollow user
- [v] Get User by Id: untuk menampilkan profile user
- [v] Add Post: untuk menambahkan post baru
- [v] Get Posts: mengambil daftar post berdasarkan yang terbaru
- [v] Get Post by Id: mengambil post berdasarkan id
- [v] Comment Post: untuk menambahkan komentar pada post
- [v] Like Post: untuk menambahkan like pada post

## Day 2

### MongoDB 2

Buatlah lookup/relasi pada method/fungsi yang berhubungan dengan MongoDB yang sudah kamu buat dengan rincian sebagai berikut:

- [v] Get Post by Id: mengambil post berdasarkan id

  - [v] Menampilkan nama/username user pada data komentar

- [v] Get User by Id: untuk menampilkan profile user
  - [v] Menampilkan list nama/username user follower
  - [v] Menampilkan list nama/username user following

### Redis - Cache

Implementasikan cache pada aplikasi GraphQL server yang sudah dibuat dengan detail sebagai berikut:

- [v] Implementasikan cache pada Get Post (Query)
- [v] Invalidate cache pada Add Post (Mutation)

## Day 3

### React Native

Buatlah aplikasi mobile React-Native dengan menggunakan expo. Aplikasi ini adalah client side dari challenge My Social Media App.
Pada aplikasi ini kamu perlu membuat screen sebagai berikut:

- [ ] Unauthenticate screen

  - [ ] Login Screen: Menampilkan form untuk login
  - [ ] Register Screen: Menampilkan form untuk register

- [ ] Authenticate screen
  - [ ] Home screen: Menampilkan list post
  - [ ] Create Post: Menampilkan form untuk menambahkan post baru
  - [ ] Post Detail Screen: Menampilkan post detail berdasarkan id dan form untuk komentar
  - [ ] Search Screen: Menampilkan form pencarian untuk mencari user (bisa digabung dengan screen lain)
  - [ ] Profile Screen: Menampilkan profile user berdasarkan id, serta menampilkan jumlah followings dan followers user.

### React Navigation

- [ ] Implementasikan navigasi pada screen yang sudah kamu buat dengan menggunakan React Navigation.

## Day 4

### GraphQL - Apollo Client

Lakukan komunikasi Aplikasi Mobile (react-native) menggunakan apollo client ke server GraphQL yang sudah dibuat. Dan Implementasikan query dan mutation sesuai dengan kebutuhan.

- [ ] Register (Mutation)
- [ ] Login (Query)
- [ ] Get Post (Query)
- [ ] Add Post (Mutation)
- [ ] Comment Post (Mutation)
- [ ] Search User (Query)
- [ ] Follow (Mutation)
- [ ] Get User (Query)
- [ ] Like Post (Mutation)
