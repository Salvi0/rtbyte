import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberAdd })
export class UserEvent extends Listener {
	public async run(member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;
		
		const dbMember = await this.container.prisma.member.findFirst({ where: { userId: member.id, guildId: member.guild.id }, include: { user: true } });
		if (!dbMember) this.container.client.emit('initializeMember', member.guild, member.user);

		if (dbMember?.timesJoined) {
			await this.container.prisma.member.update({ 
				where: { userId_guildId: { userId: member.user.id, guildId: member.guild.id } },
				data: { timesJoined: { increment: 1 } }
			});
		}
	}
}
