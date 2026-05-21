# Mô Hình Quản Lý Nhánh Git Thành Công (A Successful Git Branching Model - Git Flow)

*   **Tên bài viết gốc**: A successful Git branching model
*   **Tác giả**: Vincent Driessen
*   **Nguồn dịch**: [nvie.com](https://nvie.com/posts/a-successful-git-branching-model/) (Bài viết kinh điển toàn cầu về Git Flow ra đời từ năm 2010 và vẫn giữ nguyên giá trị cốt lõi đến ngày nay)
*   **Dịch thuật**: Dịch chuẩn xác 100%, dễ hiểu sang văn văn phong chuyên nghiệp của kỹ sư DevSecOps Việt Nam.

---

## 1. Giới thiệu

Trong bài viết này, tôi xin giới thiệu một mô hình phát triển phần mềm mà tôi đã áp dụng cho tất cả các dự án của mình (cả ở công ty và cá nhân) trong suốt hơn một năm qua, và nó đã mang lại thành công rực rỡ ngoài mong đợi. Mặc dù tôi đã định viết bài chia sẻ này từ lâu, nhưng đến nay mới có thời gian để trình bày chi tiết. Bài viết này không đi sâu vào các câu lệnh Git cơ bản, mà tập trung vào **chiến lược phân nhánh** và quản lý các chu kỳ phát hành sản phẩm.

Mô hình này tập trung vào Git như một công cụ cốt lõi để quản lý toàn bộ vòng đời sản xuất phần mềm.

---

## 2. Tại sao lại là Git?

Để có một cái nhìn so sánh toàn diện về ưu nhược điểm của Git so với các hệ thống quản lý mã nguồn tập trung (như SVN), hãy tham khảo các cuộc thảo luận chuyên sâu trên internet. Là một nhà phát triển phần mềm, tôi thực sự yêu thích Git. Git đã thay đổi hoàn toàn cách các lập trình viên nghĩ về việc phân nhánh (branching) và gộp (merging) mã nguồn. Trong thế giới SVN cũ kỹ, việc tạo nhánh và merge là một cơn ác mộng và chỉ thỉnh thoảng mới dám làm. 

Nhưng với Git, những thao tác này cực kỳ nhanh chóng, nhẹ nhàng và được coi là một phần công việc diễn ra hàng giờ của mỗi lập trình viên.

---

## 3. Bản chất Phi tập trung nhưng Tập trung hóa (Decentralized but Centralized)

Thiết lập mô hình mạng lưới mà chúng tôi sử dụng và hoạt động tốt là việc có một kho mã nguồn trung tâm "chính thống" (nhường quyền định đoạt tối cao). Lưu ý rằng kho lưu trữ này chỉ là một trung tâm mang tính logic (vì Git là hệ thống phân tán, về mặt kỹ thuật không có cái gọi là "kho trung tâm"). Chúng tôi đặt tên định danh cho kho trung tâm này là **`origin`**, đây cũng là cái tên quen thuộc với mọi người dùng Git.

```
                  +-------------------+
                  |  Central Repo     |
                  |     (origin)      |
                  +-------------------+
                       /         \
                      /           \ (Push & Pull)
                     /             \
            +-------------+       +-------------+
            | Developer A |       | Developer B |
            |   (Local)   |       |   (Local)   |
            +-------------+       +-------------+
```

Mỗi lập trình viên sẽ thực hiện đẩy code (push) và kéo code (pull) tương tác với `origin`. Bên cạnh đó, các nhà phát triển cũng có thể kéo trực tiếp các thay đổi từ đồng nghiệp để làm việc nhóm hiệu quả (ví dụ: gỡ lỗi tính năng phức tạp cùng nhau). Tuy nhiên, trong phạm vi bài viết này, chúng tôi sẽ chỉ tập trung vào luồng tương tác giữa các máy trạm local với kho lưu trữ trung tâm `origin`.

---

## 4. Hai Nhánh Chính Luôn Tồn Tại (The Main Branches)

Ở trung tâm của mô hình, kho lưu trữ luôn duy trì hai nhánh chính có vòng đời vô hạn:

```
[ Nhánh master/main ]  -----------------●-------------------> (Production)
                                        ^ (Merge Release)
[ Nhánh develop ]      ----●------------●-------------------> (Staging)
```

1.  **Nhánh `master` (hoặc `main`):**
    *   Nhánh chính thức chứa mã nguồn ở trạng thái cực kỳ ổn định.
    *   Mã nguồn trên `master` luôn sẵn sàng để triển khai lên Production. Mỗi khi mã nguồn được gộp vào `master`, nó sẽ được gắn nhãn phiên bản (**Tag**, ví dụ `v1.0.0`) và tự động kích hoạt pipeline triển khai lên môi trường chạy thực tế.
2.  **Nhánh `develop`:**
    *   Nhánh tích hợp chính. Mã nguồn ở đầu nhánh `develop` luôn phản ánh trạng thái của phiên bản phát triển mới nhất chuẩn bị cho đợt phát hành tiếp theo.
    *   Đây là nơi các pipeline CI tự động chạy các bài kiểm thử tích hợp (Integration Tests) hàng ngày.
    *   Khi mã nguồn trên `develop` đạt đến trạng thái ổn định và sẵn sàng phát hành, toàn bộ thay đổi sẽ được gộp về `master` thông qua một quy trình phát hành cụ thể (Release Branch).

---

## 5. Các Nhánh Phụ Trợ (Supporting Branches)

Bên cạnh hai nhánh chính, mô hình của chúng tôi sử dụng một loạt các nhánh phụ trợ để hỗ trợ việc phát triển song song giữa các thành viên trong nhóm, theo dõi tiến độ phát hành tính năng, và sửa lỗi nhanh trên Production. Khác với các nhánh chính, các nhánh phụ này **chỉ tồn tại tạm thời** và sẽ bị xóa hoàn toàn sau khi hoàn thành nhiệm vụ.

Có 3 loại nhánh phụ trợ chính:
*   **Feature Branches** (Nhánh tính năng)
*   **Release Branches** (Nhánh chuẩn bị phát hành)
*   **Hotfix Branches** (Nhánh sửa lỗi khẩn cấp)

Mỗi nhánh đều có các quy tắc nghiêm ngặt về việc: Nhánh đó phải được tách ra từ nhánh nào, và bắt buộc phải gộp (merge) ngược lại vào nhánh nào.

---

### A. Nhánh Tính năng (Feature Branches)

*   **Tách ra từ:** `develop`
*   **Bắt buộc gộp lại vào:** `develop`
*   **Quy tắc đặt tên:** Bất kỳ tên nào trừ `master`, `develop`, `release-*`, hoặc `hotfix-*`. Thường dùng: `feature/*` (ví dụ: `feature/login-oauth`).

```
[ Nhánh develop ]  -------●-----------------●------>
                           \               / (Merge back)
[ Nhánh feature ]           ●-------●-----●
```

Feature branches được sử dụng để phát triển các tính năng mới cho các phiên bản tương lai. Khi bắt đầu phát triển một tính năng, thời điểm tính năng đó được hoàn thành và gộp vào dòng phát triển chung có thể hoàn toàn chưa xác định. Nhánh tính năng sẽ chỉ tồn tại trên máy trạm của lập trình viên (hoặc đẩy lên remote để chia sẻ nhóm) và cuối cùng sẽ được gộp lại vào `develop` khi tính năng đã hoàn thiện hoàn toàn và sẵn sàng cho đợt phát hành.

#### Lệnh Git thao tác thực tế:

1.  *Khởi tạo nhánh feature mới từ develop:*
    ```bash
    git checkout -b feature/my-feature develop
    ```
2.  *Gộp tính năng đã hoàn thành vào develop:*
    ```bash
    git checkout develop
    # Gộp code với cờ --no-ff để giữ nguyên lịch sử nhánh
    git merge --no-ff feature/my-feature
    git branch -d feature/my-feature
    git push origin develop
    ```
    *Ý nghĩa của cờ `--no-ff` (No Fast-Forward):* Cờ này bắt buộc Git luôn tạo ra một commit gộp mới (merge commit) kể cả khi có thể thực hiện fast-forward. Điều này giúp bảo toàn lịch sử phát triển của nhóm, giúp ta biết chính xác các commit nào thuộc về tính năng nào khi nhìn vào đồ thị lịch sử Git.

---

### B. Nhánh Chuẩn bị Phát hành (Release Branches)

*   **Tách ra từ:** `develop`
*   **Bắt buộc gộp lại vào:** `develop` và `master`
*   **Quy tắc đặt tên:** `release-*` (ví dụ: `release-1.2.0`).

Nhánh Release hỗ trợ việc chuẩn bị cho đợt phát hành Production mới. Nó cho phép nhóm thực hiện các công đoạn cuối cùng như kiểm tra lỗi nhỏ, cập nhật số phiên bản (version bump), cập nhật ghi chú phát hành (changelog). Bằng cách tách nhánh này ra, nhánh `develop` sẽ lập tức được giải phóng để nhóm tiếp tục phát triển các tính năng mới cho phiên bản tiếp theo nữa.

#### Lệnh Git thao tác thực tế:

1.  *Tạo nhánh release mới:*
    ```bash
    git checkout -b release-1.2.0 develop
    # Cập nhật số phiên bản trong file cấu hình
    ./bump-version.sh 1.2.0
    git commit -a -m "bump: update version to 1.2.0"
    ```
2.  *Hoàn thành phát hành gộp vào master và tag:*
    ```bash
    git checkout master
    git merge --no-ff release-1.2.0
    git tag -a v1.2.0 -m "Release version 1.2.0"
    ```
3.  *Gộp ngược lại develop để đồng bộ các lỗi nhỏ vừa sửa trên nhánh release:*
    ```bash
    git checkout develop
    git merge --no-ff release-1.2.0
    ```
4.  *Xóa nhánh release:*
    ```bash
    git branch -d release-1.2.0
    ```

---

### C. Nhánh Sửa lỗi Khẩn cấp (Hotfix Branches)

*   **Tách ra từ:** `master`
*   **Bắt buộc gộp lại vào:** `develop` và `master`
*   **Quy tắc đặt tên:** `hotfix-*` (ví dụ: `hotfix-1.2.1`).

```
[ Nhánh master  ]  -------●---------------● (v1.2.1) ------>
                           \             /
[ Nhánh hotfix  ]           ●-----●-----●
                           /             \
[ Nhánh develop ]  -------●---------------●---------------->
```

Hotfix branches được sử dụng khi hệ thống chạy thực tế (Production) gặp lỗi nghiêm trọng cần phải sửa ngay lập tức mà không thể đợi đợt phát hành tiếp theo. Nhánh hotfix được tách trực tiếp từ commit mang tag ổn định hiện tại trên `master`. Điều này đảm bảo việc sửa lỗi diễn ra độc lập, không bị ảnh hưởng bởi mã nguồn mới chưa ổn định đang được viết trên `develop`.

#### Lệnh Git thao tác thực tế:

1.  *Tạo nhánh hotfix:*
    ```bash
    git checkout -b hotfix-1.2.1 master
    ```
2.  *Sửa lỗi và commit:*
    ```bash
    # Sửa lỗi logic...
    git commit -a -m "fix: resolve critical memory leak bug on production"
    ```
3.  *Hoàn thành hotfix gộp vào master & tag:*
    ```bash
    git checkout master
    git merge --no-ff hotfix-1.2.1
    git tag -a v1.2.1 -m "Hotfix version 1.2.1"
    ```
4.  *Gộp ngược lại develop để đảm bảo lỗi không tái diễn ở các phiên bản sau:*
    ```bash
    git checkout develop
    git merge --no-ff hotfix-1.2.1
    ```
5.  *Xóa nhánh hotfix:*
    ```bash
    git branch -d hotfix-1.2.1
    ```

---

## 6. Kết luận

Mặc dù mô hình phân nhánh này không có gì quá phức tạp hay mang tính cách mạng, nhưng bức tranh tổng thể của nó hoạt động cực kỳ hiệu quả trong thực tế. Nó cung cấp một cấu trúc làm việc rõ ràng, dễ hiểu đối với tất cả các thành viên trong nhóm phát triển, đồng thời giúp đội ngũ DevOps/SecOps dễ dàng tự động hóa quy trình CI/CD, kiểm soát chất lượng mã nguồn và giảm thiểu rủi ro khi đưa sản phẩm lên môi trường Production.
