package com.pdtwin.user;

import com.pdtwin.common.exception.BadRequestException;
import com.pdtwin.common.exception.ResourceNotFoundException;
import com.pdtwin.user.dto.CreateUserRequest;
import com.pdtwin.user.dto.UpdateUserRequest;
import com.pdtwin.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<UserResponse> findAll(Role role) {
        List<User> users = (role != null)
                ? userRepo.findByRole(role)
                : userRepo.findByRoleNot(Role.ADMIN);
        return users.stream().map(UserResponse::from).toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.from(getOrThrow(id));
    }

    public UserResponse createTeacher(CreateUserRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new BadRequestException("Username đã tồn tại: " + req.getUsername());
        }
        String pwd = (req.getPassword() != null && !req.getPassword().isBlank()) ? req.getPassword() : req.getUsername();
        User user = User.builder()
                .username(req.getUsername())
                .passwordHash(encoder.encode(pwd))
                .fullName(req.getFullName())
                .role(Role.TEACHER)
                .build();
        return UserResponse.from(userRepo.save(user));
    }

    public UserResponse update(Long id, UpdateUserRequest req) {
        User user = getOrThrow(id);
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getActive() != null) user.setActive(req.getActive());
        if (req.getRole() != null) user.setRole(req.getRole());
        return UserResponse.from(userRepo.save(user));
    }

    public void delete(Long id) {
        User user = getOrThrow(id);
        user.setActive(false);
        userRepo.save(user);
    }

    public List<UserResponse> importStudentsFromExcel(MultipartFile file) throws IOException {
        List<UserResponse> created = new ArrayList<>();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String fullName = cellStr(row, 0);
                String studentId = cellStr(row, 1);
                if (fullName.isBlank() || studentId.isBlank()) continue;

                String username = studentId.trim();
                if (userRepo.existsByUsername(username)) continue;

                User user = User.builder()
                        .username(username)
                        .passwordHash(encoder.encode(username))
                        .fullName(fullName.trim())
                        .studentId(studentId.trim())
                        .role(Role.STUDENT)
                        .build();
                created.add(UserResponse.from(userRepo.save(user)));
            }
        }
        return created;
    }

    public User getOrThrow(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user id=" + id));
    }

    private String cellStr(Row row, int col) {
        var cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }
}
