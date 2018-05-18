const requestPromise = require('request-promise')
const R = require('ramda')

const queryInvestmentRepo = async q => {
	try {
		const data = await requestPromise({
			uri: 'http://47.100.101.130/v1/projects',
			qs: {
				expand: 'white_papers,post_user,invest_token',
				// status: '4,5,6',
				q
			},
			headers: {
				Authorization: 'Bearer aopE3QZdH-PORNIQKL9DQWecOtsE2AfY'
			},
			json: true
		})

		if (!R.isEmpty(data)) {
			return Promise.resolve(data[0])
		}
		return Promise.reject(data)
	} catch (error) {
		return Promise.reject(error)
	}
}

const formatRes = ({
	status,
	name,
	description,
	source,
	token_name,
	channel,
	site_url,
	watch_user,
	review,
	region,
	own_ratio,
	status_comment
}) => {
	const project_name = `${name}${(token_name && ` (${token_name}) `) ||
		''}：\n\n`
	const project_desc = `${(description && `${description}\n\n`) || ''}`
	const project_status = `${(status && `状态：${statusMapper(status)}\n`) ||
		''}`
	const project_status_comment = `${(status_comment &&
		`状态备注：${status_comment}\n`) ||
		''}`

	const project_region = `${(region && `国别：${region}\n`) || ''}`
	const project_channel = `${(channel && `渠道：${channel}\n`) || ''}`
	const project_watch_user = `${(watch_user && `跟进人：${watch_user}\n`) ||
		''}`
	const project_own_ratio = `${(own_ratio && `团队持有比例：${own_ratio}\n`) ||
		''}`
	const project_site = `${(site_url && `官网：${site_url}\n`) || ''}`
	const project_review = `${(review && `推荐语：${review}\n`) || ''}`

	return `${project_name}${project_desc}${project_status}${project_status_comment}${project_region}${project_channel}${project_watch_user}${project_own_ratio}${project_review}${project_site}`
}

const statusMapper = status => {
	switch (status) {
		case 0:
			return '待初筛'
		case 1:
			return '待上会'
		case 2:
			return 'PASS'
		case 3:
			return '待跟进'
		case 4:
			return '确定意向'
		case 5:
			return '待打币'
		case 6:
			return '已打币'
		default:
			return '未知'
	}
}

const handleInvestmentQuery = async message => {
	const room = await message.room().topic()
	if (room !== 'QRB') {
		return
	}

	const q = R.trim(message.content())
	const project = await queryInvestmentRepo(q)
	message.say(formatRes(project))
}

module.exports = {
	handleInvestmentQuery
}