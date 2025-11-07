package com.collegeplanner.controller;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Notice;
import com.collegeplanner.repository.NoticeRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NoticesController {

	private final NoticeRepository noticeRepository;

	@GetMapping("/notices")
	public ResponseEntity<List<Notice>> getNotices() {
		List<Notice> notices = noticeRepository.findAllActiveNotices();
		if (notices != null) {
			return ResponseEntity.ok()
					.cacheControl(CacheControl.maxAge(60, TimeUnit.SECONDS))
					.body(notices);
		} else {
			return null;
		}
	}

}