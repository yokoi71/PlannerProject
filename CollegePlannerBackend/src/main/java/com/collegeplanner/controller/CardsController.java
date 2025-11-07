package com.collegeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Cards;
import com.collegeplanner.repository.CardsRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CardsController {

	private final CardsRepository cardsRepository;

	@GetMapping("/myCards")
	public List<Cards> getCardDetails(@RequestParam long id) {
		List<Cards> cards = cardsRepository.findByCustomerId(id);
		if (cards != null) {
			return cards;
		} else {
			return null;
		}
	}

}