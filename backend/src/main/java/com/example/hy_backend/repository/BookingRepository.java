package com.example.hy_backend.repository;

import com.example.hy_backend.model.Booking;
import com.example.hy_backend.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    @Query("SELECT b FROM Booking b JOIN FETCH b.facility WHERE b.employeeId = :employeeId ORDER BY b.createdAt DESC")
    List<Booking> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") String employeeId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.facility WHERE b.bookingId = :bookingId")
    Optional<Booking> findByIdWithFacility(@Param("bookingId") Long bookingId);

        List<Booking> findByEmployeeIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String employeeId,
            LocalDateTime start,
            LocalDateTime end
        );

            List<Booking> findByEmployeeIdAndBookingDateOrderByCreatedAtDesc(String employeeId, LocalDate bookingDate);

            boolean existsByEmployeeIdAndFacilityFacilityIdAndBookingDateAndStatus(
                String employeeId,
                Long facilityId,
                LocalDate bookingDate,
                BookingStatus status
            );

            long countByEmployeeId(String employeeId);

            long countByEmployeeIdAndStatus(String employeeId, BookingStatus status);

    long countByStatus(BookingStatus status);

    long countByFacilityFacilityIdAndStatusAndCreatedAtBetween(
            Long facilityId,
            BookingStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    long countByFacilityFacilityIdAndBookingDateAndStatus(Long facilityId, LocalDate bookingDate, BookingStatus status);

    long countByStatusAndCreatedAtBetween(BookingStatus status, LocalDateTime start, LocalDateTime end);

    Optional<Booking> findByEmployeeIdAndClientRequestId(String employeeId, String clientRequestId);

        Optional<Booking> findFirstByEmployeeIdAndFacilityFacilityIdAndBookingDateAndStatusOrderByCreatedAtDesc(
            String employeeId,
            Long facilityId,
            LocalDate bookingDate,
            BookingStatus status
        );

    Optional<Booking> findByQrCode(String qrCode);

    long countByFacilityFacilityIdAndBookingDate(Long facilityId, LocalDate bookingDate);

    long countByBookingDate(LocalDate bookingDate);

    long countByBookingDateAndStatus(LocalDate bookingDate, BookingStatus status);
}
