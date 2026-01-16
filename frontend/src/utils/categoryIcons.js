
import {
    FiHome, FiShoppingBag, FiShoppingCart, FiPackage, FiGrid, FiLayers, FiBox,
    FiWatch, FiSmartphone, FiMonitor, FiCamera, FiHeadphones, FiCpu, FiBattery, FiWifi, FiTv, FiTablet,
    FiCoffee, FiTool, FiDroplet, FiScissors, FiHeart, FiStar, FiActivity, FiAward, FiBook, FiMusic, FiVideo, FiImage,
    FiTruck, FiGift, FiTag, FiZap, FiSettings, FiUsers, FiUser, FiGlobe, FiMapPin, FiCalendar, FiClock, FiCreditCard,
    FiTrendingUp, FiBarChart, FiBriefcase, FiShield, FiLock, FiKey, FiBell, FiMail, FiMessageCircle, FiSearch, FiFilter,
    FiFile, FiFolder, FiArchive, FiDatabase, FiServer, FiHardDrive, FiPrinter, FiCopy, FiDownload, FiShare2, FiLink,
    FiExternalLink, FiBookmark, FiTarget, FiCrosshair, FiPower, FiRadio, FiMic, FiVolume2, FiPlay, FiPause, FiUmbrella,
    FiSun, FiMoon, FiCloud, FiThermometer, FiNavigation, FiCompass, FiFlag, FiMap, FiThumbsUp, FiThumbsDown, FiInfo,
    FiHelpCircle, FiAlertCircle, FiCheckCircle, FiXCircle, FiCheck, FiX, FiPlus, FiMinus, FiEdit, FiTrash, FiRefreshCw,
    FiRotateCw, FiRotateCcw, FiMaximize2, FiMinimize2, FiType, FiBold, FiItalic, FiUnderline, FiList, FiLayout, FiSidebar,
    FiColumns, FiSliders, FiToggleLeft, FiToggleRight, FiCheckSquare, FiSquare, FiCircle, FiAlertTriangle, FiAlertOctagon,
    FiZapOff, FiBatteryCharging, FiWifiOff, FiRss, FiPhone, FiPhoneCall, FiPhoneOff, FiMessageSquare, FiSend, FiInbox,
    FiPaperclip, FiLink2, FiShare, FiArrowRight, FiArrowLeft, FiArrowUp, FiArrowDown, FiChevronRight, FiChevronLeft,
    FiChevronUp, FiChevronDown, FiMove, FiFileText, FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiSkipBack,
    FiSkipForward, FiRepeat, FiShuffle, FiVolumeX, FiVolume, FiVolume1, FiMicOff, FiMaximize, FiMinimize, FiCornerUpRight,
    FiCornerUpLeft, FiCornerDownRight, FiCornerDownLeft, FiCornerRightUp, FiCornerRightDown, FiCornerLeftUp, FiCornerLeftDown,
    FiEye, FiEyeOff, FiUserCheck, FiUserPlus, FiUserX, FiUnlock, FiAnchor, FiAperture, FiCast, FiChrome, FiCode,
    FiCommand, FiDisc, FiDollarSign, FiFeather, FiFilm, FiFrown, FiGithub, FiGitlab, FiHardDrive as FiHdd, FiHash,
    FiLifeBuoy, FiLoader, FiMeh, FiMenu, FiMousePointer, FiMusic as FiMusicNote, FiOctagon, FiPercent, FiPieChart,
    FiPocket, FiPrinter as FiPrint, FiSave, FiSlack, FiSmile, FiSpeaker, FiTerminal, FiTrello, FiTrendingDown, FiTriangle,
    FiTruck as FiTruckDiff, FiTwitch, FiTwitter, FiVideo as FiVideoDiff, FiVoicemail, FiWind, FiXSquare, FiYoutube, FiZoomIn, FiZoomOut
} from 'react-icons/fi';

import {
    MdCategory, MdStore, MdStorefront, MdPets, MdLocalGroceryStore, MdChildCare, MdToys, MdCardGiftcard,
    MdOutlineSportsCricket, MdOutlineSportsSoccer, MdOutlineSportsTennis, MdOutlineSportsVolleyball,
    MdOutlineSportsBasketball, MdDirectionsBike, MdDirectionsRun, MdPool, MdFitnessCenter, MdSpa, MdHotel,
    MdLocalPharmacy, MdLocalFlorist, MdLocalBar, MdLocalCafe, MdLocalDining, MdLocalPizza, MdLocalLaundryService,
    MdLocalMovies, MdLocalOffer, MdLocalShipping, MdLocalTaxi, MdSchool, MdScience, MdWork, MdBuild, MdGavel,
    MdBusinessCenter, MdAccountBalance, MdAttachMoney, MdEmojiEvents, MdEmojiFoodBeverage, MdEmojiNature, MdEmojiObjects,
    MdEmojiPeople, MdEmojiSymbols, MdEmojiTransportation, MdEngineering, MdEnhancedEncryption, MdFace, MdFastfood,
    MdFavorite, MdFlight, MdForest, MdFormatPaint, MdGames, MdGarage, MdGolfCourse,
    MdGrass, MdHandyman, MdHealing, MdHealthAndSafety, MdHiking, MdHistoryEdu, MdHomeRepairService, MdHvac,
    MdIceSkating, MdImage, MdInsertPhoto, MdInventory, MdKayaking, MdKeyboard, MdKitchen, MdLandscape, MdLaptopMac,
    MdLibraryBooks, MdLightbulb, MdLiquor, MdLiving, MdLuggage, MdLunchDining, MdMapsHomeWork, MdMedicalServices,
    MdMemory, MdMenuBook, MdMicrowave, MdMilitaryTech, MdMiscellaneousServices, MdModelTraining, MdMonitor,
    MdMoped, MdMovie, MdMuseum, MdMusicNote, MdNature, MdNaturePeople, MdNightlife, MdNordicWalking,
    MdOutlineAgriculture, MdOutlineArchitecture, MdOutlineAutoAwesome, MdOutlineBed, MdOutlineChair,
    MdOutlineCleaningServices, MdOutlineCoffeeMaker, MdOutlineConstruction, MdOutlineDiamond, MdOutlineDryCleaning,
    MdOutlineElectricBolt, MdOutlineElectricalServices, MdOutlineFestival, MdOutlineFireplace, MdOutlineFlashlightOn,
    MdOutlineFlatware, MdOutlineLocalGasStation, MdOutlineLocalPolice, MdOutlineMedicalInformation, MdOutlineModeFanOff,
    MdOutlinePark, MdOutlinePedalBike, MdOutlinePlumbing, MdOutlinePrecisionManufacturing, MdOutlineRecycling,
    MdOutlineRoomService, MdOutlineScience, MdOutlineSolarPower, MdOutlineSportsEsports, MdOutlineSurfing,
    MdOutlineWbSunny, MdOutlineYard, MdPalette, MdPets as MdPaw, MdPhonelink, MdPhotoCamera, MdPiano, MdPlumbing,
    MdPrecisionManufacturing, MdPsychology, MdPublic, MdQuestionAnswer, MdRadio, MdRealEstateAgent, MdReceipt,
    MdRecordVoiceOver, MdRestaurant, MdRestaurantMenu, MdRocketLaunch, MdRollerSkating, MdRoom, MdRouter,
    MdRowing, MdSanitizer, MdSatellite, MdSavings, MdScanner, MdScatterPlot, MdScubaDiving, MdSecurity,
    MdSelfImprovement, MdSensorDoor, MdSensorWindow, MdSetMeal, MdShoppingBag, MdShoppingBasket, MdShoppingCart,
    MdShower, MdSkateboarding, MdSmartToy, MdSmokingRooms, MdSnowboarding, MdSnowmobile, MdSnowshoeing,
    MdSoap, MdSocialDistance, MdSpeaker, MdSpeakerGroup, MdSpeed, MdSports, MdSportsBar, MdSportsBaseball,
    MdSportsFootball, MdSportsGolf, MdSportsGymnastics, MdSportsHandball, MdSportsHockey, MdSportsKabaddi,
    MdSportsMartialArts, MdSportsMma, MdSportsMotorsports, MdSportsRugby, MdStar, MdStarBorder, MdStarHalf,
    MdStoreMallDirectory, MdStorm, MdStraighten, MdStyle, MdSubway, MdSupport, MdSurfing, MdSynagogue,
    MdTableBar, MdTableRestaurant, MdTablet, MdTabletAndroid, MdTabletMac, MdTag, MdTakeoutDining, MdTaxiAlert,
    MdTerrain, MdTheaters, MdThermostat, MdTimer, MdTireRepair, MdTitle, MdToc,
    MdToday, MdToll, MdTonality, MdTopic, MdTouchApp, MdTour, MdToys as MdToysDiff, MdTrackChanges, MdTraffic,
    MdTrain, MdTram, MdTransferWithinAStation, MdTransform, MdTransgender, MdTransitEnterexit, MdTranslate,
    MdTravelExplore, MdTripOrigin, MdTrolley, MdTty, MdTune, MdTurnedIn, MdTurnedInNot, MdTv, MdTwoWheeler,
    MdUmbrella, MdUnarchive, MdUndo, MdUnfoldLess, MdUnfoldMore, MdUpdate, MdUpload, MdUploadFile, MdUsb,
    MdVerified, MdVerticalSplit, MdVibration, MdVideoCall, MdVideocam, MdVideocamOff, MdVideogameAsset,
    MdVideoLabel, MdVideoLibrary, MdVideoSettings, MdViewAgenda, MdViewArray, MdViewCarousel,
    MdViewColumn, MdViewComfy, MdViewCompact, MdViewDay, MdViewHeadline, MdViewList, MdViewModule,
    MdViewQuilt, MdViewSidebar, MdViewStream, MdViewTimeline, MdViewWeek, MdVignette, MdVilla, MdVisibility,
    MdVisibilityOff, MdVoiceChat, MdVoicemail, MdVolumeDown, MdVolumeMute, MdVolumeOff, MdVolumeUp,
    MdVolunteerActivism, MdVpnKey, MdVpnLock, MdVrpano, MdWallpaper, MdWarehouse, MdWarning, MdWash,
    MdWatch, MdWatchLater, MdWater, MdWaterDamage, MdWaterDrop, MdWaterfallChart, MdWaves, MdWbAuto,
    MdWbCloudy, MdWbIncandescent, MdWbIridescent, MdWbShade, MdWbSunny, MdWbTwilight, MdWc, MdWeb,
    MdWebAsset, MdWebhook, MdWeekend, MdWest, MdWhatsapp, MdWhatshot, MdWheelchairPickup, MdWhereToVote,
    MdWidgets, MdWifi, MdWifiCalling, MdWifiLock, MdWifiOff, MdWifiTethering, MdWindow, MdWineBar,
    MdWork as MdWorkDiff, MdWorkHistory, MdWorkOff, MdWorkOutline, MdWorkspacePremium, MdWorkspaces,
    MdWrapText, MdWrongLocation, MdWysiwyg, MdYard, MdYoutubeSearchedFor, MdZoomIn, MdZoomOut, MdZoomOutMap
} from 'react-icons/md';

import {
    IoShirtOutline, IoShirt, IoBagHandleOutline, IoWatchOutline, IoPhonePortraitOutline, IoLaptopOutline,
    IoCameraOutline, IoHeadsetOutline, IoGameControllerOutline, IoHomeOutline, IoBedOutline, IoRestaurantOutline,
    IoBookOutline, IoMusicalNotesOutline, IoCarOutline, IoFitnessOutline, IoNutritionOutline, IoConstructOutline,
    IoColorPaletteOutline, IoPawOutline, IoAirplaneOutline, IoBicycleOutline, IoBoatOutline, IoBuildOutline,
    IoBusOutline, IoBusinessOutline, IoCafeOutline, IoCalendarOutline, IoCallOutline, IoCardOutline, IoCartOutline,
    IoCashOutline, IoChatboxOutline, IoCheckmarkCircleOutline, IoCloudOutline, IoCodeSlashOutline, IoCogOutline,
    IoCompassOutline, IoDesktopOutline, IoDiamondOutline, IoDocumentTextOutline, IoEarthOutline, IoEaselOutline,
    IoEyeOutline, IoFastFoodOutline, IoFilmOutline, IoFilterOutline, IoFishOutline, IoFlagOutline, IoFlameOutline,
    IoFlashOutline, IoFlaskOutline, IoFlowerOutline, IoFolderOutline, IoFootballOutline, IoGameController,
    IoGiftOutline, IoGlassesOutline, IoGlobeOutline, IoGolfOutline, IoGridOutline, IoHammerOutline, IoHandLeftOutline,
    IoHappyOutline, IoHardwareChipOutline, IoHeartOutline, IoHelpCircleOutline, IoHourglassOutline, IoIceCreamOutline,
    IoImageOutline, IoInformationCircleOutline, IoJournalOutline, IoKeyOutline, IoKeypadOutline, IoLanguageOutline,
    IoLeafOutline, IoLibraryOutline, IoLinkOutline, IoListOutline, IoLocationOutline, IoLockClosedOutline,
    IoLogoAndroid, IoLogoApple, IoLogoBitcoin, IoLogoCss3, IoLogoDesignernews, IoLogoDribbble, IoLogoDropbox,
    IoLogoEuro, IoLogoFacebook, IoLogoFoursquare, IoLogoGithub, IoLogoGoogle, IoLogoGooglePlaystore,
    IoLogoHackernews, IoLogoHtml5, IoLogoInstagram, IoLogoIonitron, IoLogoLinkedin, IoLogoMarkdown,
    IoLogoNoSmoking, IoLogoNodejs, IoLogoOctocat, IoLogoPinterest, IoLogoPlaystation, IoLogoPython, IoLogoReddit,
    IoLogoRss, IoLogoSass, IoLogoSkype, IoLogoSlack, IoLogoSnapchat, IoLogoSteam, IoLogoTumblr, IoLogoTux,
    IoLogoTwitch, IoLogoTwitter, IoLogoUsd, IoLogoVimeo, IoLogoVk, IoLogoWhatsapp, IoLogoWindows, IoLogoWordpress,
    IoLogoXbox, IoLogoYahoo, IoLogoYen, IoLogoYoutube, IoMagnetOutline, IoMailOutline, IoMailOpenOutline,
    IoManOutline, IoMapOutline, IoMedalOutline, IoMedicalOutline, IoMedkitOutline, IoMegaphoneOutline,
    IoMenuOutline, IoMicOutline, IoMoonOutline, IoMoveOutline, IoMusicalNoteOutline, IoNewspaperOutline,
    IoNotificationsOutline, IoNuclearOutline, IoOpenOutline, IoOptionsOutline, IoPaperPlaneOutline,
    IoPartlySunnyOutline, IoPauseCircleOutline, IoPaw, IoPeopleOutline, IoPersonAddOutline, IoPersonCircleOutline,
    IoPersonOutline, IoPieChartOutline, IoPinOutline, IoPintOutline, IoPizzaOutline, IoPlanetOutline,
    IoPlayCircleOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline, IoPodiumOutline, IoPowerOutline,
    IoPricetagOutline, IoPricetagsOutline, IoPrintOutline, IoPulseOutline, IoPushOutline, IoQrCodeOutline,
    IoRadioOutline, IoRadioButtonOffOutline, IoRadioButtonOnOutline, IoRainyOutline, IoReaderOutline,
    IoReceiptOutline, IoRecordingOutline, IoRefreshCircleOutline, IoRefreshOutline, IoReloadCircleOutline,
    IoReloadOutline, IoRemoveCircleOutline, IoRemoveOutline, IoReorderTwoOutline, IoReorderThreeOutline,
    IoReorderFourOutline, IoRepeatOutline, IoResizeOutline, IoRestaurant, IoReturnDownBackOutline,
    IoReturnDownForwardOutline, IoReturnUpBackOutline, IoReturnUpForwardOutline, IoRibbonOutline, IoRocketOutline,
    IoRoseOutline, IoSadOutline, IoSaveOutline, IoScanOutline, IoSchoolOutline, IoSearchCircleOutline,
    IoSearchOutline, IoSendOutline, IoServerOutline, IoSettingsOutline, IoShapesOutline, IoShareOutline,
    IoShareSocialOutline, IoShieldCheckmarkOutline, IoShieldOutline, IoShuffleOutline, IoSkullOutline,
    IoSnowOutline, IoSpeedometerOutline, IoSquareOutline, IoStarHalfOutline, IoStarOutline, IoStatsChartOutline,
    IoStopCircleOutline, IoStopOutline, IoStopwatchOutline, IoSubwayOutline, IoSunnyOutline, IoSwapHorizontalOutline,
    IoSwapVerticalOutline, IoSyncCircleOutline, IoSyncOutline, IoTabletLandscapeOutline, IoTabletPortraitOutline,
    IoTennisballOutline, IoTerminalOutline, IoTextOutline, IoThermometerOutline, IoThumbsDownOutline,
    IoThumbsUpOutline, IoThunderstormOutline, IoTimeOutline, IoTimerOutline, IoTodayOutline, IoToggleOutline,
    IoTrailSignOutline, IoTrainOutline, IoTransgenderOutline, IoTrashBinOutline, IoTrashOutline, IoTrendingDownOutline,
    IoTrendingUpOutline, IoTriangleOutline, IoTrophyOutline, IoTvOutline, IoUmbrellaOutline, IoVideocamOffOutline,
    IoVideocamOutline, IoVolumeHighOutline, IoVolumeLowOutline, IoVolumeMediumOutline, IoVolumeMuteOutline,
    IoVolumeOffOutline, IoWalkOutline, IoWalletOutline, IoWarningOutline, IoWatch, IoWaterOutline, IoWifiOutline,
    IoWineOutline, IoWomanOutline
} from 'react-icons/io5';

import { LuFootprints, LuUtensilsCrossed, LuDumbbell, LuBaby, LuIndianRupee, LuArmchair, LuBanana, LuBeef, LuBike, LuBird, LuBone, LuBriefcase, LuBug, LuCake, LuCandy, LuCarrot, LuCat, LuCherry, LuCigarette, LuCitrus, LuClapperboard, LuCloudRain, LuCloudSnow, LuCloudSun, LuCodepen, LuCoins, LuComponent, LuConciergeBell, LuConstruction, LuContact, LuCookie, LuCroissant, LuCrown, LuCupSoda, LuDatabase, LuDog, LuDoorOpen, LuDrumstick, LuEgg, LuEggFried, LuFactory, LuFan, LuFerrisWheel, LuFish, LuFlower, LuFlower2, LuGamepad, LuGamepad2, LuGhost, LuGlassWater, LuGrape, LuHammer, LuHardHat, LuJoystick, LuLamp, LuLandmark, LuLanguages, LuLibrary, LuLollipop, LuMartini, LuMegaphone, LuMic, LuMilk, LuMountain, LuMountainSnow, LuMusic, LuNut, LuPackage, LuPackage2, LuPackageCheck, LuPackageMinus, LuPackageOpen, LuPackagePlus, LuPackageSearch, LuPackageX, LuPaintbrush, LuPalette, LuPartyPopper, LuPenTool, LuPencil, LuPiggyBank, LuPizza, LuPlane, LuPlug, LuPlug2, LuPocket, LuPopsicle, LuPuzzle, LuRadio, LuRatio, LuRefrigerator, LuRocket, LuRockingChair, LuRuler, LuSalad, LuSandwich, LuScale, LuScissors, LuScroll, LuSearch, LuServer, LuSheet, LuShield, LuShip, LuShirt, LuShovel, LuShrub, LuSkull, LuSlice, LuSmartphone, LuSmile, LuSnowflake, LuSofa, LuSoup, LuSpeaker, LuSpline, LuSprout, LuStamp, LuStar, LuStethoscope, LuSticker, LuStickyNote, LuStore, LuSun, LuSunrise, LuSunset, LuSword, LuSyringe, LuTable, LuTablet, LuTag, LuTarget, LuTent, LuTerminal, LuTestTube, LuThermometer, LuThermometerSun, LuTicket, LuTimer, LuTornado, LuToyBrick, LuTrash, LuTrash2, LuTreeDeciduous, LuTreePine, LuTrendingDown, LuTrendingUp, LuTrophy, LuTruck, LuTv,  LuTwitch, LuTwitter, LuType, LuUmbrella, LuUndo, LuUndo2, LuUpload, LuUsb, LuUser, LuUserCheck, LuUserCog, LuUserMinus, LuUserPlus, LuUserX, LuUsers, LuUtensils, LuVegan, LuVenetianMask, LuVibrate, LuVideo, LuVideoOff, LuVoicemail, LuVolume, LuVolume1, LuVolume2, LuVolumeX, LuVote, LuWallet, LuWand,  LuWarehouse, LuWatch, LuWaves, LuWebcam, LuWheat, LuWifi, LuWifiOff, LuWind, LuWine, LuWrench, LuX, LuYoutube, LuZap, LuZapOff, LuZoomIn, LuZoomOut } from 'react-icons/lu';

export const iconComponents = {
    // Top/Header Categories
    FiHome, FiShoppingBag, FiShoppingCart, FiPackage, FiGrid, FiLayers, FiBox,
    MdCategory, MdStore, MdStorefront, MdStoreMallDirectory,

    // Fashion & Apparel (Men, Women, Kids etc)
    IoShirtOutline, IoShirt, LuFootprints, IoBagHandleOutline, FiWatch, IoWatchOutline,
    IoGlassesOutline, MdStyle, IoWomanOutline, IoManOutline, LuShirt, LuWatch,

    // Electronics & Gadgets
    FiSmartphone, IoPhonePortraitOutline, IoLaptopOutline, FiMonitor, FiCamera, IoCameraOutline,
    FiHeadphones, IoHeadsetOutline, FiCpu, FiBattery, FiWifi, FiTv, FiTablet, IoGameControllerOutline,
    MdSpeaker, MdRouter, MdKeyboard, MdMemory, MdDeveloperBoard: FiCpu,
    LuSmartphone, LuTablet, LuTv, LuSpeaker, LuHeadphones: FiHeadphones,

    // Home & Kitchen
    IoHomeOutline, IoBedOutline, FiCoffee, LuUtensilsCrossed, IoRestaurantOutline, FiTool,
    MdKitchen, MdMicrowave, MdLiving, MdOutlineChair, MdOutlineBed,
    LuSofa, LuArmchair, LuLamp, LuRefrigerator, LuUtensils, LuConciergeBell,

    // Grocery & Food
    MdLocalGroceryStore, MdFastfood, MdRestaurant, MdOutlineLocalGasStation,
    LuCarrot, LuBanana, LuCherry, LuGrape, LuCitrus,
    LuBeef, LuDrumstick, LuFish, LuSandwich, LuPizza, LuCake, LuCookie, LuCandy, LuLollipop, LuPopcorn: LuCupSoda, LuCoffee: FiCoffee, LuMilk, LuWine, LuMartini, LuBeer: MdLocalBar,
    MdLocalPizza, MdSetMeal, MdEmojiFoodBeverage, MdLocalCafe,

    // Beauty & Personal Care
    FiDroplet, FiScissors, FiHeart, FiStar, MdSpa, MdHealthAndSafety, MdFace,
    LuSyringe, LuStethoscope, LuPill: MdMedicalServices, LuThermometer,

    // Sports & Fitness
    IoFitnessOutline, LuDumbbell, FiActivity, FiAward, MdFitnessCenter, MdPool, MdSports,
    MdSportsFootball, MdSportsBaseball, MdSportsBasketball: MdOutlineSportsBasketball,
    MdSportsTennis: MdOutlineSportsTennis, MdSportsGolf, MdSportsHockey, MdSportsVolleyball: MdOutlineSportsVolleyball,
    MdOutlineSportsCricket, MdOutlineSportsSoccer, MdPedalBike: MdOutlinePedalBike, IoBicycleOutline,
    LuTrophy, LuMedal: FiAward, LuTarget,

    // Books & Media & Entertainment
    FiBook, IoBookOutline, FiMusic, IoMusicalNotesOutline, FiVideo, FiImage,
    MdLibraryBooks, MdMovie, MdMusicNote, MdGamepad: LuGamepad, MdGames, MdToys,
    LuBook: FiBook, LuMusic, LuVideo, LuClapperboard, LuGamepad2,

    // Automotive & Vehicles
    IoCarOutline, FiTruck, IoBusOutline, MdElectricCar: MdOutlineSolarPower,
    LuCar: IoCarOutline, LuTruck, LuBus: IoBusOutline, LuBike, LuTractor: MdOutlineAgriculture,

    // Baby & Kids
    LuBaby, FiGift, MdChildCare, MdStroller: LuBaby, MdToys, LuToyBrick,

    // Nature & Outdoors & Gardening
    MdNature, MdForest, MdGrass, MdOutlineYard, LuFlower, LuTreePine, LuLeaf: IoLeafOutline,
    LuSprout, LuSun, LuCloudRain, LuMountain, LuTent,

    // Pets & Animals
    MdPets, IoPawOutline, LuDog, LuCat, LuBird, LuFish, LuBone,

    // Industrial & Tools
    MdBuild, MdEngineering, MdHandyman, MdHardware: IoHammerOutline,
    LuHammer, LuWrench, LuDrill: FiTool, LuHardHat, LuFactory, LuWarehouse,

    // Office & Stationery
    FiPaperclip, FiPrinter, FiFolder, FiFileText, MdAttachFile: FiPaperclip,
    LuPenTool, LuPencil, LuRuler, LuScissors, LuStickyNote, LuBriefcase,

    // Services (Travel, Finance, Real Estate etc)
    MdFlight, MdHotel, MdRealEstateAgent, MdLocalShipping, MdLocalTaxi,
    LuPlane, LuShip, LuHotel: MdHotel, LuTicket, LuWallet, LuCoins, LuPiggyBank, LuCreditCard: FiCreditCard,
    LuLandmark, LuBuilding: MdBusinessCenter,

    // Holidays & Events
    MdCelebration: LuPartyPopper, MdFestival: MdOutlineFestival, FiGift, LuPartyPopper, LuCake,

    // General/Utility
    FiTag, FiZap, FiSettings, FiUsers, FiUser, FiGlobe, FiMapPin, FiCalendar, FiClock,
    FiCreditCard, IndianRupee: LuIndianRupee, FiTrendingUp, FiBarChart, FiBriefcase, FiShield, FiLock, FiKey,
    FiBell, FiMail, FiMessageCircle, FiSearch, FiFilter, FiFile, FiArchive, FiDatabase,
    FiServer, FiHardDrive, FiCopy, FiDownload, FiShare2, FiLink, FiExternalLink,
    FiBookmark, FiCrosshair, FiPower, FiRadio, FiMic,
    FiVolume2, FiPlay, FiPause, FiUmbrella, FiMoon, FiCloud, FiNavigation, FiCompass, FiFlag, FiMap, FiThumbsUp, FiThumbsDown, FiInfo,
    FiHelpCircle, FiAlertCircle, FiCheckCircle, FiXCircle, FiCheck, FiX, FiPlus, FiMinus, FiEdit, FiTrash,
    FiRefreshCw, FiRotateCw, FiRotateCcw, FiMaximize2, FiMinimize2, FiType, FiBold, FiItalic,
    FiUnderline, FiList, FiLayout, FiSidebar, FiColumns, FiSliders, FiToggleLeft,
    FiToggleRight, FiCheckSquare, FiSquare, FiCircle, FiAlertTriangle, FiAlertOctagon,
    FiZapOff, FiBatteryCharging,
    FiWifiOff, FiRss, FiPhone, FiPhoneCall, FiPhoneOff, FiMessageSquare,
    FiSend, FiInbox, FiLink2, FiShare, FiArrowRight, FiArrowLeft, FiArrowUp,
    FiArrowDown, FiChevronRight, FiChevronLeft, FiChevronUp, FiChevronDown, FiMove,
    FiAlignLeft, FiAlignCenter, FiAlignRight,
    FiAlignJustify, FiSkipBack, FiSkipForward,
    FiRepeat, FiShuffle, FiVolumeX, FiVolume, FiVolume1, FiMicOff, FiMaximize,
    FiMinimize, FiCornerUpRight, FiCornerUpLeft, FiCornerDownRight, FiCornerDownLeft,
    FiCornerRightUp, FiCornerRightDown, FiCornerLeftUp, FiCornerLeftDown, FiEye, FiEyeOff,
    FiUserCheck, FiUserPlus, FiUserX, FiUnlock,
};

// Add backward compatibility
iconComponents.IoFitnessOutline = IoFitnessOutline;

export const getIconComponent = (iconValue) => {
    if (!iconValue) return null;
    // Handle backward compatibility
    if (iconValue === "FiDollarSign") {
        return LuIndianRupee;
    }
    return iconComponents[iconValue] || null;
};
