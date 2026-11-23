package com.luxorides.fleet.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.luxorides.fleet.entity.Category;
import com.luxorides.fleet.entity.Chauffeur;
import com.luxorides.fleet.entity.ChauffeurStatus;
import com.luxorides.fleet.entity.Role;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.entity.Vehicle;
import com.luxorides.fleet.repository.ChauffeurRepository;
import com.luxorides.fleet.repository.UserRepository;
import com.luxorides.fleet.repository.VehicleRepository;

// Runs once on startup and fills empty tables with sample data
@Component
public class DataSeeder implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final UserRepository userRepository;

    public DataSeeder(VehicleRepository vehicleRepository,
                      ChauffeurRepository chauffeurRepository,
                      UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.chauffeurRepository = chauffeurRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (vehicleRepository.count() == 0) {
            seedVehicles();
        }
        if (chauffeurRepository.count() == 0) {
            seedChauffeurs();
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedVehicles() {
        // Delhi NCR
        saveVehicle("BMW 7 Series", Category.SEDAN, "Delhi NCR", 15000, 1800);
        saveVehicle("Toyota Vellfire", Category.SUV, "Delhi NCR", 18000, 2000);
        saveVehicle("Mercedes-Maybach S580", Category.ULTRA_LUXURY, "Delhi NCR", 45000, 5000);
        // Mumbai
        saveVehicle("Audi A6", Category.SEDAN, "Mumbai", 11000, 1200);
        saveVehicle("Toyota Innova Crysta", Category.SUV, "Mumbai", 8000, 900);
        saveVehicle("Mercedes S-Class", Category.ULTRA_LUXURY, "Mumbai", 30000, 3500);
        // Bangalore
        saveVehicle("Mercedes E-Class", Category.SEDAN, "Bangalore", 12000, 1300);
        saveVehicle("Toyota Vellfire", Category.SUV, "Bangalore", 18000, 2000);
        saveVehicle("Rolls-Royce Ghost", Category.ULTRA_LUXURY, "Bangalore", 65000, 7000);
    }

    private void saveVehicle(String name, Category category, String city, int basePrice, int extraHourRate) {
        vehicleRepository.save(new Vehicle(name, category, city,
                BigDecimal.valueOf(basePrice), BigDecimal.valueOf(extraHourRate)));
    }

    private void seedChauffeurs() {
        chauffeurRepository.save(new Chauffeur("Rajesh Kumar", "9810000001", "Delhi NCR", ChauffeurStatus.AVAILABLE));
        chauffeurRepository.save(new Chauffeur("Amit Sharma", "9810000002", "Delhi NCR", ChauffeurStatus.AVAILABLE));
        chauffeurRepository.save(new Chauffeur("Sunil Patil", "9820000001", "Mumbai", ChauffeurStatus.AVAILABLE));
        chauffeurRepository.save(new Chauffeur("Vikram Singh", "9820000002", "Mumbai", ChauffeurStatus.OFF_DUTY));
        chauffeurRepository.save(new Chauffeur("Ravi Gowda", "9880000001", "Bangalore", ChauffeurStatus.AVAILABLE));
        chauffeurRepository.save(new Chauffeur("Manjunath Rao", "9880000002", "Bangalore", ChauffeurStatus.AVAILABLE));
    }

    private void seedUsers() {
        userRepository.save(new User("Demo Customer", "customer@luxorides.com", "customer123", Role.CUSTOMER));
        userRepository.save(new User("Ops Admin", "admin@luxorides.com", "admin123", Role.ADMIN));
    }
}