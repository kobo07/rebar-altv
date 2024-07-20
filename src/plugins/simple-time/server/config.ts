export const TimeConfig = {
    // 如果设置为true，它将覆盖所有其他设置
    // 这将使用当前服务器时间作为主要游戏时间
    useServerTime: true,
    // 如果上面的设置为false，minutesPerMinute 表示每分钟游戏内经过的分钟数。
    // 例如，如果设置为2 minutesPerMinute，则每分钟游戏内时间增加2分钟
    // 这样你将在24小时内经历2个夜晚周期
    // 而如果设置为6，则在24小时内经历6个夜晚周期
    minutesPerMinute: 5,
    // 如果不使用服务器时间，起始时间
    startHour: 9,
    startMinute: 0,
};
