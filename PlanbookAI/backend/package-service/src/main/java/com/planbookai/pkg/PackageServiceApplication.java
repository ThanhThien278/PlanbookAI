package com.planbookai.pkg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PackageServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(PackageServiceApplication.class, args);
	}
}
